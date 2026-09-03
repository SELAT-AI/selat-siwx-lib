import { describe, expect, it } from "vitest";
import { formatMessage, parseMessage } from "./message";
import type { SIWxMessage } from "../types";

describe("Message formatting", () => {
  const baseMessage: SIWxMessage = {
    domain: "example.com",
    address: "0x1234567890123456789012345678901234567890",
    uri: "https://example.com/login",
    version: "1",
    chainId: "eip155:1",
    nonce: "32891757",
    issuedAt: "2021-09-30T16:25:24.000Z",
  };

  it("formats basic message", () => {
    const formatted = formatMessage(baseMessage);
    expect(formatted).toContain("example.com wants you to sign in with your account:");
    expect(formatted).toContain("Chain ID: eip155:1");
  });

  it("round-trips format and parse", () => {
    const withOptional: SIWxMessage = {
      ...baseMessage,
      statement: "Test statement",
      expirationTime: "2021-09-30T18:25:24.000Z",
      notBefore: "2021-09-30T16:20:24.000Z",
      requestId: "request-456",
      resources: ["https://example.com/resource1", "https://example.com/resource2"],
    };

    const parsed = parseMessage(formatMessage(withOptional));
    expect(parsed).toEqual(withOptional);
  });
}
);
