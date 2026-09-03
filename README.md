# selat-siwx-lib

A chain-agnostic authentication library implementing the [CAIP-122](https://github.com/ChainAgnostic/CAIPs/blob/master/CAIPs/caip-122.md) standard for Sign-In with X (SIWx) across multiple blockchain ecosystems.

## Features

- 🔗 **Chain Agnostic**: Unified API for multiple blockchain namespaces
- 🔐 **Secure**: Follows CAIP-122 standard for authentication
- 🧩 **Smart Wallet Support**: EIP-155 verification supports EIP-1271 contract wallets
- 🚀 **Easy to Use**: Simple and intuitive API
- 📦 **TypeScript**: Full TypeScript support with type definitions
- ⚡ **Lightweight**: Minimal dependencies

## Supported Chains

- **EIP-155** (Intersection of Circle Gateway mainnet and Circle Agent Wallet mainnet): Ethereum, OP Mainnet, Unichain, Polygon PoS, Arc, Base, Avalanche C-Chain, Arbitrum One
- **Solana** (Solana blockchain)
- **BIP-322** (Bitcoin)

## Installation

```bash
npm install @selat-ai/siwx-lib
```

## Quick Start

### Basic Usage

```typescript
import { SIWx } from "@selat-ai/siwx-lib";

// Create a message
const message = SIWx.createMessage({
  domain: "example.com",
  address: "0x1234567890123456789012345678901234567890",
  chainId: "eip155:1",
  uri: "https://example.com/login",
  statement: "Sign in to Example.com",
});

// Sign the message
const result = await SIWx.signMessage(message, privateKey);
console.log(result.signature);

// Verify the signature (chainRpcUrl is required for EIP-1271 contract wallet validation)
const isValid = await SIWx.verifySignature(
  message,
  result.signature,
  "https://mainnet.infura.io/v3/<YOUR_KEY>"
);
console.log(isValid); // true
```

### Chain-Specific Usage

#### Ethereum (EIP-155)

```typescript
import { eip155, createMessage } from "@selat-ai/siwx-lib";

const message = createMessage({
  domain: "example.com",
  address: "0x1234567890123456789012345678901234567890",
  chainId: "eip155:1", // Ethereum mainnet
  uri: "https://example.com/login",
  statement: "Sign in with Ethereum",
  nonce: "random-nonce",
  issuedAt: new Date().toISOString(),
});

// Sign with Ethereum private key
const result = await eip155.signMessage(message, "0x...");

// Verify
const isValid = await eip155.verifySignature({
  message,
  signature: result.signature,
  chainRpcUrl: "https://mainnet.infura.io/v3/<YOUR_KEY>",
});
```

#### Circle Agent Wallet signing + SIWx verification (no private key)

This example signs the SIWx formatted message with Circle Agent Wallet CLI, then verifies with `SIWx.verifySignature`.

Prerequisites:

- Install and authenticate Circle CLI (`@circle-fin/cli`)
- Export environment variables:
  - `CIRCLE_WALLET_ADDRESS` (wallet address to sign with)
  - `EIP155_RPC_URL` (RPC URL for EIP-1271 contract wallet checks)
  - Optional: `CHAIN_ID` (default `eip155:8453`)

Run:

```bash
npx tsx examples/circle-agent-wallet-sign-verify.ts
```

#### Solana

```typescript
import { solana, createMessage } from "@selat-ai/siwx-lib";

const message = createMessage({
  domain: "example.com",
  address: "GwAF45zjfyGzUbd3i3hXxzGeuchzEZXwpRYHZM5912F1",
  chainId: "solana:mainnet",
  uri: "https://example.com/login",
  statement: "Sign in with Solana",
});

// Sign with Solana keypair
const result = await solana.signMessage(message, keypairSecretKey);

// Verify
const isValid = await solana.verifySignature({
  message,
  signature: result.signature,
});
```

## API Reference

### `SIWx`

The main unified API object.

#### `SIWx.createMessage(options)`

Creates a SIWx message object.

**Options:**

- `domain` (string, required): The domain requesting the signature
- `address` (string, required): The blockchain address
- `chainId` (ChainId, required): The CAIP-2 chain ID (e.g., "eip155:1")
- `uri` (string, required): The URI of the service
- `version` (string, optional): Version of the message (default: "1")
- `statement` (string, optional): Human-readable statement
- `nonce` (string, optional): Random nonce (auto-generated if not provided)
- `issuedAt` (string, optional): ISO 8601 timestamp (default: current time)
- `expirationTime` (string, optional): ISO 8601 timestamp
- `notBefore` (string, optional): ISO 8601 timestamp
- `requestId` (string, optional): Request identifier
- `resources` (string[], optional): List of resources

#### `SIWx.verifySignature(message, signature, chainRpcUrl?)`

Verifies a SIWx signature using the chain adapter derived from `message.chainId`.

- `message` (SIWxMessage, required): The SIWx message to verify
- `signature` (string, required): The signature to verify
- `chainRpcUrl` (string, optional): RPC URL used by EIP-155 for EIP-1271 contract wallet verification

Note: For EIP-155 EOAs, verification does not require `chainRpcUrl`. For EIP-1271 contract wallets, `chainRpcUrl` is required.

## Standards

This library implements:

- [CAIP-2](https://github.com/ChainAgnostic/CAIPs/blob/master/CAIPs/caip-2.md): Blockchain ID Specification
- [CAIP-10](https://github.com/ChainAgnostic/CAIPs/blob/master/CAIPs/caip-10.md): Account ID Specification
- [CAIP-122](https://github.com/ChainAgnostic/CAIPs/blob/master/CAIPs/caip-122.md): Sign in With X (SIWx)
- [EIP-191](https://eips.ethereum.org/EIPS/eip-191): Signed Data Standard (for Ethereum)
- [EIP-4361](https://eips.ethereum.org/EIPS/eip-4361): Sign-In with Ethereum
- [BIP-322](https://github.com/bitcoin/bips/blob/master/bip-0322.mediawiki): Generic Signed Message Format

## License

MIT
