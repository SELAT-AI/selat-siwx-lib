import type {
  ChainAdapter,
  SIWxMessage,
  SignatureResult,
  VerificationParams,
  VerificationResult,
} from "../types";

export class SolanaAdapter implements ChainAdapter {
  namespace = "solana" as const;

  formatMessage(message: SIWxMessage): string {
    const parts: string[] = [];

    parts.push(`${message.domain} wants you to sign in with your Solana account:`);
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
      const { sign } = await import("@noble/ed25519");

      const messageBytes = new TextEncoder().encode(formattedMessage);
      const privateKeyBytes = typeof privateKey === "string" ? this.base58ToBytes(privateKey) : privateKey;

      const signatureBytes = await sign(messageBytes, privateKeyBytes.slice(0, 32));
      const signature = this.bytesToBase58(signatureBytes);

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
      const { verify } = await import("@noble/ed25519");
      const formattedMessage = this.formatMessage(params.message);

      const messageBytes = new TextEncoder().encode(formattedMessage);
      const publicKeyBytes = this.base58ToBytes(params.message.address);
      const signatureBytes = this.base58ToBytes(params.signature);

      const valid = await verify(signatureBytes, messageBytes, publicKeyBytes);
      return { isValid: valid };
    } catch {
      return { isValid: false };
    }
  }

  getSignatureType(): string {
    return "solana:ed25519";
  }

  private base58ToBytes(base58: string): Uint8Array {
    const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    const base58Map = new Map<string, number>();
    ALPHABET.split("").forEach((char, i) => base58Map.set(char, i));

    let result = BigInt(0);
    for (const char of base58) {
      const value = base58Map.get(char);
      if (value === undefined) throw new Error(`Invalid base58 character: ${char}`);
      result = result * BigInt(58) + BigInt(value);
    }

    const bytes: number[] = [];
    while (result > BigInt(0)) {
      bytes.unshift(Number(result % BigInt(256)));
      result /= BigInt(256);
    }

    for (const char of base58) {
      if (char === "1") bytes.unshift(0);
      else break;
    }

    return new Uint8Array(bytes);
  }

  private bytesToBase58(bytes: Uint8Array): string {
    const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

    let num = BigInt(0);
    for (const byte of bytes) {
      num = num * BigInt(256) + BigInt(byte);
    }

    let result = "";
    while (num > BigInt(0)) {
      const remainder = Number(num % BigInt(58));
      result = ALPHABET[remainder] + result;
      num /= BigInt(58);
    }

    for (const byte of bytes) {
      if (byte === 0) result = `1${result}`;
      else break;
    }

    return result;
  }
}

export const solana = new SolanaAdapter();
