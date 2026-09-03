import { SIWx, eip155, solana, createMessage } from "../src/index";

// Example 1: Using unified API
async function unifiedExample() {
  console.log("=== Unified API Example ===");

  // Create a message for Ethereum
  const ethMessage = SIWx.createMessage({
    domain: "example.com",
    address: "0x1234567890123456789012345678901234567890",
    chainId: "eip155:1",
    uri: "https://example.com/login",
    statement: "Sign in to Example.com with Ethereum",
  });

  console.log("Formatted message:");
  console.log(SIWx.formatMessage(ethMessage));
  console.log("\n");
}

// Example 2: Ethereum specific
async function ethereumExample() {
  console.log("=== Ethereum (EIP-155) Example ===");

  const message = createMessage({
    domain: "myapp.com",
    address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    chainId: "eip155:1", // Ethereum mainnet
    uri: "https://myapp.com/login",
    statement: "Sign in with Ethereum to MyApp",
    resources: ["https://myapp.com/terms", "https://myapp.com/privacy"],
  });

  console.log("Message to sign:");
  console.log(eip155.formatMessage(message));
  console.log("\nSignature type:", eip155.getSignatureType());
  console.log("\n");
}

// Example 3: Solana specific
async function solanaExample() {
  console.log("=== Solana Example ===");

  const message = createMessage({
    domain: "solana-app.com",
    address: "GwAF45zjfyGzUbd3i3hXxzGeuchzEZXwpRYHZM5912F1",
    chainId: "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp", // Solana mainnet
    uri: "https://solana-app.com/login",
    statement: "Sign in with Solana",
  });

  console.log("Message to sign:");
  console.log(solana.formatMessage(message));
  console.log("\nSignature type:", solana.getSignatureType());
  console.log("\n");
}

// Example 4: Creating message with all optional fields
async function fullMessageExample() {
  console.log("=== Full Message Example ===");

  const message = SIWx.createMessage({
    domain: "example.com",
    address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    chainId: "eip155:1",
    uri: "https://example.com/login",
    version: "1",
    statement: "I accept the Example Terms of Service: https://example.com/tos",
    nonce: "32891757",
    issuedAt: "2021-09-30T16:25:24.000Z",
    expirationTime: "2021-09-30T18:25:24.000Z",
    notBefore: "2021-09-30T16:20:24.000Z",
    requestId: "request-123",
    resources: [
      "ipfs://Qme7ss3ARVgxv6rXqVPiikMJ8u2NLgmgszg13pYrDKEoiu",
      "https://example.com/my-web2-claim.json",
    ],
  });

  console.log("Full formatted message:");
  console.log(SIWx.formatMessage(message));
  console.log("\n");
}

// Run all examples
async function main() {
  await unifiedExample();
  await ethereumExample();
  await solanaExample();
  await fullMessageExample();
}

main().catch(console.error);
