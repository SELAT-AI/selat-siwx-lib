import type {
  ChainAdapter,
  SIWxMessage,
  SignatureResult,
  VerificationParams,
  VerificationResult,
} from "../types";

export class BIP322Adapter implements ChainAdapter {
  namespace = "bip322" as const;

  formatMessage(message: SIWxMessage): string {
    const parts: string[] = [];

    parts.push(`${message.domain} wants you to sign in with your Bitcoin account:`);
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
      const { Signer } = await import("bip322-js");

      const privateKeyHex =
        typeof privateKey === "string" ? privateKey : Buffer.from(privateKey).toString("hex");

      const signature = Signer.sign(privateKeyHex, message.address, formattedMessage);

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
      const { Verifier } = await import("bip322-js");
      const formattedMessage = this.formatMessage(params.message);

      const valid = Verifier.verifySignature(
        params.message.address,
        formattedMessage,
        params.signature
      );

      return { isValid: valid };
    } catch {
      return { isValid: false };
    }
  }

  getSignatureType(): string {
    return "bip322";
  }
}

export const bip322 = new BIP322Adapter();
