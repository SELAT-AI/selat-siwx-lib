import type {
  ChainAdapter,
  SIWxMessage,
  SignatureResult,
  VerificationParams,
  VerificationResult,
} from "../types";
import {
  CIRCLE_GATEWAY_EVM_MAINNET_CHAIN_IDS,
  CIRCLE_GATEWAY_EVM_MAINNET_CHAIN_NAMES,
} from "./chains";
import {
  createPublicClient,
  getAddress,
  hashMessage,
  http,
  keccak256,
  recoverMessageAddress,
  toHex,
} from "viem";
import { signMessage as signEvmMessage } from "viem/accounts";

const EIP1271_MAGIC_VALUE = "0x1626ba7e";

const EIP1271_BYTES32_ABI = [
  {
    type: "function",
    name: "isValidSignature",
    stateMutability: "view",
    inputs: [
      { name: "hash", type: "bytes32" },
      { name: "signature", type: "bytes" },
    ],
    outputs: [{ name: "magicValue", type: "bytes4" }],
  },
] as const;

const EIP1271_BYTES_ABI = [
  {
    type: "function",
    name: "isValidSignature",
    stateMutability: "view",
    inputs: [
      { name: "data", type: "bytes" },
      { name: "signature", type: "bytes" },
    ],
    outputs: [{ name: "magicValue", type: "bytes4" }],
  },
] as const;

export class EIP155Adapter implements ChainAdapter {
  namespace = "eip155" as const;

  private getChainName(chainId: string): string {
    const id = chainId.split(":")[1];
    const chainNumericId = Number(id);
    if (Number.isFinite(chainNumericId)) {
      return CIRCLE_GATEWAY_EVM_MAINNET_CHAIN_NAMES[chainNumericId] ?? "EVM";
    }
    return "EVM";
  }

  formatMessage(message: SIWxMessage): string {
    const parts: string[] = [];
    const chainName = this.getChainName(message.chainId);

    parts.push(`${message.domain} wants you to sign in with your ${chainName} account:`);
    parts.push(message.address);
    parts.push("");

    if (message.statement) {
      parts.push(message.statement);
      parts.push("");
    }

    parts.push(`URI: ${message.uri}`);
    parts.push(`Version: ${message.version}`);
    parts.push(`Chain ID: ${message.chainId.split(":")[1]}`);
    parts.push(`Nonce: ${message.nonce}`);
    parts.push(`Issued At: ${message.issuedAt}`);

    if (message.expirationTime) {
      parts.push(`Expiration Time: ${message.expirationTime}`);
    }

    if (message.notBefore) {
      parts.push(`Not Before: ${message.notBefore}`);
    }

    if (message.requestId) {
      parts.push(`Request ID: ${message.requestId}`);
    }

    if (message.resources && message.resources.length > 0) {
      parts.push("Resources:");
      message.resources.forEach((resource) => {
        parts.push(`- ${resource}`);
      });
    }

    return parts.join("\n");
  }

  async signMessage(
    message: SIWxMessage,
    privateKey: string | Uint8Array
  ): Promise<SignatureResult> {
    const formattedMessage = this.formatMessage(message);

    try {
      const signature = await signEvmMessage({
        message: formattedMessage,
        privateKey:
          typeof privateKey === "string"
            ? (privateKey as `0x${string}`)
            : (`0x${Buffer.from(privateKey).toString("hex")}` as `0x${string}`),
      });

      return {
        message: formattedMessage,
        signature,
        signatureType: this.getSignatureType(),
      };
    } catch (error) {
      throw new Error(`Failed to sign message: ${error}`);
    }
  }

  async verifySignature(params: VerificationParams): Promise<VerificationResult> {
    try {
      const chainNumericId = Number(params.message.chainId.split(":")[1]);
      // Keep EVM verification support aligned with Circle Gateway mainnet coverage.
      if (
        !Number.isFinite(chainNumericId) ||
        !CIRCLE_GATEWAY_EVM_MAINNET_CHAIN_IDS.has(chainNumericId)
      ) {
        return { isValid: false };
      }

      const formattedMessage = this.formatMessage(params.message);
      const expectedAddress = getAddress(params.message.address);

      const recoveredAddress = await recoverMessageAddress({
        message: formattedMessage,
        signature: params.signature as `0x${string}`,
      });

      const signerWalletAddress =
        recoveredAddress.toLowerCase() === expectedAddress.toLowerCase()
          ? undefined
          : recoveredAddress;

      if (recoveredAddress.toLowerCase() === expectedAddress.toLowerCase()) {
        return { isValid: true };
      }

      const rpcUrl = params.chainRpcUrl;
      if (!rpcUrl) {
        return { isValid: false, signerWalletAddress };
      }

      const client = createPublicClient({
        transport: http(rpcUrl),
      });

      const bytecode = await client.getBytecode({
        address: expectedAddress as `0x${string}`,
      });
      if (!bytecode || bytecode === "0x") {
        return { isValid: false, signerWalletAddress };
      }

      const digestCandidates = [hashMessage(formattedMessage), keccak256(toHex(formattedMessage))];

      for (const digest of digestCandidates) {
        try {
          const result = await client.readContract({
            address: expectedAddress as `0x${string}`,
            abi: EIP1271_BYTES32_ABI,
            functionName: "isValidSignature",
            args: [digest, params.signature as `0x${string}`],
          });

          if ((result as string).toLowerCase() === EIP1271_MAGIC_VALUE) {
            return { isValid: true, signerWalletAddress };
          }
        } catch {
          // Try alternate EIP-1271 variant below.
        }
      }

      try {
        const result = await client.readContract({
          address: expectedAddress as `0x${string}`,
          abi: EIP1271_BYTES_ABI,
          functionName: "isValidSignature",
          args: [toHex(formattedMessage), params.signature as `0x${string}`],
        });

        if ((result as string).toLowerCase() === EIP1271_MAGIC_VALUE) {
          return { isValid: true, signerWalletAddress };
        }
      } catch {
        // Contract does not expose bytes variant.
      }

      return { isValid: false, signerWalletAddress };
    } catch {
      return { isValid: false };
    }
  }

  getSignatureType(): string {
    return "eip191";
  }
}

export const eip155 = new EIP155Adapter();
