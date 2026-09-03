import type { SIWxMessage } from "../types";

export function formatMessage(message: SIWxMessage): string {
  const parts: string[] = [];

  parts.push(`${message.domain} wants you to sign in with your account:`);
  parts.push(message.address);
  parts.push("");

  if (message.statement) {
    parts.push(message.statement);
    parts.push("");
  }

  parts.push(`URI: ${message.uri}`);
  parts.push(`Version: ${message.version}`);
  parts.push(`Chain ID: ${message.chainId}`);
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

export function parseMessage(messageString: string): SIWxMessage {
  const lines = messageString.split("\n");

  const domainLine = lines[0];
  const domain = domainLine.split(" wants you to sign in with your account:")[0];
  const address = lines[1];

  let currentIndex = 3;
  let statement: string | undefined;

  if (lines[currentIndex] && !lines[currentIndex].startsWith("URI:")) {
    const statementLines: string[] = [];
    while (
      currentIndex < lines.length &&
      lines[currentIndex] &&
      !lines[currentIndex].startsWith("URI:")
    ) {
      statementLines.push(lines[currentIndex]);
      currentIndex++;
    }
    statement = statementLines.join("\n").trim();
    currentIndex++;
  }

  const fields: Record<string, string> = {};
  const resources: string[] = [];
  let inResources = false;

  for (let i = currentIndex; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("Resources:")) {
      inResources = true;
      continue;
    }

    if (inResources) {
      if (line.startsWith("- ")) {
        resources.push(line.substring(2));
      }
      continue;
    }

    const colonIndex = line.indexOf(":");
    if (colonIndex !== -1) {
      const key = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim();
      fields[key] = value;
    }
  }

  return {
    domain,
    address,
    statement,
    uri: fields.URI,
    version: fields.Version,
    chainId: fields["Chain ID"] as SIWxMessage["chainId"],
    nonce: fields.Nonce,
    issuedAt: fields["Issued At"],
    expirationTime: fields["Expiration Time"],
    notBefore: fields["Not Before"],
    requestId: fields["Request ID"],
    resources: resources.length > 0 ? resources : undefined,
  };
}
