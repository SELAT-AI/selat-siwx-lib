import type { ChainAdapter, SIWxMessage, SignatureResult } from "./types";
import type { ChainId, Namespace } from "./chains/chains";
import { eip155 } from "./chains/eip155";
import { solana } from "./chains/solana";
import { bip322 } from "./chains/bip322";
import { generateNonce } from "./utils/nonce";

const adapters = new Map<Namespace, ChainAdapter>([
  ["eip155", eip155],
  ["solana", solana],
  ["bip322", bip322],
]);

export function getAdapter(namespace: Namespace): ChainAdapter {
  const adapter = adapters.get(namespace);
  if (!adapter) {
    throw new Error(`Unsupported namespace: ${namespace}`);
  }
  return adapter;
}

export function getAdapterFromChainId(chainId: ChainId): ChainAdapter {
  const namespace = chainId.split(":")[0] as Namespace;
  return getAdapter(namespace);
}

export interface CreateMessageOptions {
  domain: string;
  address: string;
  chainId: ChainId;
  uri: string;
  version?: string;
  statement?: string;
  nonce?: string;
  issuedAt?: string;
  expirationTime?: string;
  notBefore?: string;
  requestId?: string;
  resources?: string[];
}

export function createMessage(options: CreateMessageOptions): SIWxMessage {
  return {
    domain: options.domain,
    address: options.address,
    uri: options.uri,
    version: options.version || "1",
    chainId: options.chainId,
    nonce: options.nonce || generateNonce(),
    issuedAt: options.issuedAt || new Date().toISOString(),
    statement: options.statement,
    expirationTime: options.expirationTime,
    notBefore: options.notBefore,
    requestId: options.requestId,
    resources: options.resources,
  };
}

export async function signMessage(
  message: SIWxMessage,
  privateKey: string | Uint8Array
): Promise<SignatureResult> {
  const adapter = getAdapterFromChainId(message.chainId);
  return adapter.signMessage(message, privateKey);
}

export async function verifySignature(
  message: SIWxMessage,
  signature: string,
  chainRpcUrl?: string
): Promise<boolean> {
  const adapter = getAdapterFromChainId(message.chainId);
  const result = await adapter.verifySignature({ message, signature, chainRpcUrl });
  return result.isValid;
}

export function formatMessage(message: SIWxMessage): string {
  const adapter = getAdapterFromChainId(message.chainId);
  return adapter.formatMessage(message);
}

export const SIWx = {
  createMessage,
  signMessage,
  verifySignature,
  formatMessage,
  getAdapter,
  getAdapterFromChainId,
};
