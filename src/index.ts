// Core types
export type {
  SIWxMessage,
  SignatureResult,
  VerificationParams,
  VerificationResult,
  ChainAdapter,
} from "./types";
export type { ChainId, Namespace } from "./chains/chains";

// Chain adapters
export { eip155 } from "./chains/eip155";
export { solana } from "./chains/solana";
export { bip322 } from "./chains/bip322";

// Utilities
export { generateNonce } from "./utils/nonce";
export { AuthError } from "./utils/error";

// Unified API
export {
  SIWx,
  createMessage,
  signMessage,
  verifySignature,
  getAdapter,
  getAdapterFromChainId,
} from "./unified";
export type { CreateMessageOptions } from "./unified";
