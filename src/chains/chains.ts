export type Namespace =
  | "eip155"
  | "solana"
  | "bip322"
  | "cosmos"
  | "near"
  | "polkadot";

export type ChainId = `${Namespace}:${string}`;

// EVM chain support is intentionally restricted to the overlap between:
// 1) Circle Gateway mainnet supported chains
// 2) Circle Agent Wallet mainnet supported chains
// Sources:
// - https://developers.circle.com/gateway/references/supported-blockchains
// - https://developers.circle.com/agent-stack/agent-wallets/supported-blockchains
export const CIRCLE_GATEWAY_EVM_MAINNET_CHAIN_NAMES: Record<number, string> = {
  1: "Ethereum",
  10: "OP Mainnet",
  130: "Unichain",
  137: "Polygon PoS",
  5042: "Arc",
  8453: "Base",
  43114: "Avalanche C-Chain",
  42161: "Arbitrum One",
};

export const CIRCLE_GATEWAY_EVM_MAINNET_CHAIN_IDS = new Set<number>(
  Object.keys(CIRCLE_GATEWAY_EVM_MAINNET_CHAIN_NAMES).map((value) => Number(value))
);
