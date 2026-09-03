import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { SIWx, createMessage } from "../src/index";
import type { ChainId } from "../src/chains/chains";

const execFileAsync = promisify(execFile);

const CAIP_TO_CIRCLE_CHAIN: Record<number, string> = {
  1: "ETH",
  10: "OP",
  130: "UNI",
  137: "MATIC",
  5042: "ARC",
  8453: "BASE",
  42161: "ARB",
  43114: "AVAX",
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function parseEip155ChainId(chainId: ChainId): number {
  const [namespace, reference] = chainId.split(":");
  if (namespace !== "eip155") {
    throw new Error(`This example only supports eip155 chain IDs. Received: ${chainId}`);
  }

  const numericId = Number(reference);
  if (!Number.isFinite(numericId)) {
    throw new Error(`Invalid eip155 chain ID reference: ${reference}`);
  }

  return numericId;
}

function extractSignature(output: string): string {
  const matches = output.match(/0x[a-fA-F0-9]+/g);
  const signature = matches?.at(-1);

  if (!signature) {
    throw new Error(`Unable to parse signature from circle CLI output:\n${output}`);
  }

  return signature;
}

async function signWithCircleAgentWallet(
  formattedMessage: string,
  walletAddress: string,
  circleChain: string
): Promise<string> {
  const args = [
    "wallet",
    "sign",
    "message",
    formattedMessage,
    "--address",
    walletAddress,
    "--chain",
    circleChain,
  ];

  const { stdout, stderr } = await execFileAsync("circle", args, {
    maxBuffer: 10 * 1024 * 1024,
  });

  return extractSignature(`${stdout}\n${stderr}`);
}

async function main() {
  const walletAddress = requireEnv("CIRCLE_WALLET_ADDRESS");
  const rpcUrl = requireEnv("EIP155_RPC_URL");
  const chainId = (process.env.CHAIN_ID ?? "eip155:8453") as ChainId;

  const chainNumericId = parseEip155ChainId(chainId);
  const circleChain = CAIP_TO_CIRCLE_CHAIN[chainNumericId];
  if (!circleChain) {
    throw new Error(
      `Unsupported eip155 chain for this example: ${chainId}. Supported: ${Object.keys(CAIP_TO_CIRCLE_CHAIN)
        .map((id) => `eip155:${id}`)
        .join(", ")}`
    );
  }

  const message = createMessage({
    domain: process.env.SIWX_DOMAIN ?? "example.com",
    address: walletAddress,
    chainId,
    uri: process.env.SIWX_URI ?? "https://example.com/login",
    statement: process.env.SIWX_STATEMENT ?? "Sign in with Circle Agent Wallet",
  });

  const formattedMessage = SIWx.formatMessage(message);

  console.log("Signing with Circle Agent Wallet CLI...");
  const signature = await signWithCircleAgentWallet(formattedMessage, walletAddress, circleChain);

  console.log("Verifying with SIWx.verifySignature...");
  const isValid = await SIWx.verifySignature(message, signature, rpcUrl);

  console.log("Chain ID:", chainId);
  console.log("Circle chain:", circleChain);
  console.log("Wallet:", walletAddress);
  console.log("Signature:", signature);
  console.log("Verification result:", isValid);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
