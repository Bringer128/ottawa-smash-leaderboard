import { verify } from "@noble/ed25519";
import {IncomingHttpHeaders} from 'http'

const PUBLIC_KEY =
  "b0888227e1c0f3c97c8f8376187c7de0d8cb96a0db7fd3281f6dcdafd9597b49";

const signatureHeader = "x-signature-ed25519";
const timestampHeader = "x-signature-timestamp";
const badRequest = { code: 401 };

export async function discordAuth(headers: IncomingHttpHeaders, rawBody: Buffer | undefined) {
  if (headers == null || rawBody == null) return;
  if (!headers[signatureHeader] || !headers[timestampHeader]) {
    console.log("missing header");
    return badRequest;
  }

  const signature = headers[signatureHeader] as string;
  const timestamp = headers[timestampHeader];

  if (!signature.match(/^[0-9A-Za-z]+$/)) {
    console.log("bad sig");
    return badRequest;
  }

  try {
    const isValid = await verify(
      signature,
      Buffer.from(`${timestamp}${rawBody}`),
      PUBLIC_KEY
    );
    if (!isValid) {
      console.log("verify failed");
      return badRequest;
    }
  } catch (e) {
    console.log(`verify failed: ${e}`);
    return badRequest;
  }

  return null;
}
