import { describe, expect, it } from "vitest";
import { eip155 } from "./eip155";
import type { SIWxMessage } from "../types";

describe("EIP155 adapter", () => {
  const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
  const message: SIWxMessage = {
    domain: "example.com",
    address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    uri: "https://example.com/login",
    version: "1",
    chainId: "eip155:1",
    nonce: "32891757",
    issuedAt: "2021-09-30T16:25:24.000Z",
  };

  it("formats with chain name", () => {
    const formatted = eip155.formatMessage(message);
    expect(formatted).toContain("Ethereum account");
    expect(formatted).toContain("Chain ID: 1");
  });

  it("signs and verifies", async () => {
    const signed = await eip155.signMessage(message, privateKey);
    const verification = await eip155.verifySignature({
      message,
      signature: signed.signature,
    });

    expect(verification.isValid).toBe(true);
  });
});
