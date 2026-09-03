import type { ChainId, Namespace } from "./chains/chains";

export interface SIWxMessage {
  domain: string;
  address: string;
  statement?: string;
  uri: string;
  version: string;
  chainId: ChainId;
  nonce: string;
  issuedAt: string;
  expirationTime?: string;
  notBefore?: string;
  requestId?: string;
  resources?: string[];
}

export interface SignatureResult {
  message: string;
  signature: string;
  signatureType: string;
}

export interface VerificationParams {
  message: SIWxMessage;
  signature: string;
  chainRpcUrl?: string;
}

export interface VerificationResult {
  isValid: boolean;
  signerWalletAddress?: string;
}

export interface ChainAdapter {
  namespace: Namespace;

  formatMessage(message: SIWxMessage): string;

  signMessage(
    message: SIWxMessage,
    privateKey: string | Uint8Array
  ): Promise<SignatureResult>;

  verifySignature(params: VerificationParams): Promise<VerificationResult>;

  getSignatureType(): string;
}
