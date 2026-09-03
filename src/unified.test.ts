import { describe, expect, it } from "vitest";
import { SIWx, createMessage, formatMessage, getAdapter, getAdapterFromChainId } from "./unified";
import type { SIWxMessage } from "./types";

describe("Unified API", () => {
  it("creates a message with defaults", () => {
    const message = createMessage({
      domain: "example.com",
      address: "0x1234567890123456789012345678901234567890",
      chainId: "eip155:1",
      uri: "https://example.com/login",
    });

    expect(message.version).toBe("1");
    expect(message.nonce).toBeDefined();
    expect(message.issuedAt).toBeDefined();
  });

  it("resolves adapters by namespace and chainId", () => {
    expect(getAdapter("eip155").namespace).toBe("eip155");
    expect(getAdapterFromChainId("solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp").namespace).toBe("solana");
    expect(getAdapterFromChainId("bip322:000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f").namespace).toBe("bip322");
  });

  it("formats chain-specific messages", () => {
    const evmMessage: SIWxMessage = {
      domain: "example.com",
      address: "0x1234567890123456789012345678901234567890",
      uri: "https://example.com/login",
      version: "1",
      chainId: "eip155:1",
      nonce: "n1",
      issuedAt: "2021-09-30T16:25:24.000Z",
    };

    const formatted = formatMessage(evmMessage);
    expect(formatted).toContain("Ethereum account");
    expect(formatted).toContain("Chain ID: 1");
  });

  it("can sign and verify EVM message", async () => {
    const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
    const address = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

    const message = SIWx.createMessage({
      domain: "example.com",
      address,
      chainId: "eip155:1",
      uri: "https://example.com/login",
      statement: "Sign in with Ethereum",
    });

    const result = await SIWx.signMessage(message, privateKey);
    const isValid = await SIWx.verifySignature(message, result.signature);

    expect(result.signature).toMatch(/^0x[0-9a-f]+$/i);
    expect(isValid).toBe(true);
  });
});
