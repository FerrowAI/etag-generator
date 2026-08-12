import { createHash } from "crypto";
import { stat } from "fs";
import { promisify } from "util";

const statAsync = promisify(stat);

export interface ETagOptions {
  weak?: boolean;
}

export interface DecideResult {
  status: 200 | 304;
  headers: Record<string, string>;
}

export function strongETag(content: string | Buffer): string {
  const buffer = typeof content === "string" ? Buffer.from(content) : content;
  const digest = createHash("sha256").update(buffer).digest("base64url");
  const short = digest.substring(0, 27);
  return `"${short}"`;
}

export function weakETag(size: number, mtime: number): string {
  const hash = createHash("sha256")
    .update(`${size}:${mtime}`)
    .digest("base64url");
  return `W/"${hash.substring(0, 27)}"`;
}

export function ifNoneMatch(header: string | undefined, etag: string): boolean {
  if (!header) return false;

  const parts = header.split(",").map((s) => s.trim());

  for (const part of parts) {
    if (part === "*") return true;

    // Remove W/ prefix for comparison
    const normalized = part.replace(/^W\//, "");
    const normalizedETag = etag.replace(/^W\//, "");

    if (normalized === normalizedETag) return true;
  }

  return false;
}

export function decide(
  reqHeaders: Record<string, string | undefined>,
  etag: string,
  lastModified?: Date
): DecideResult {
  const ifNone = reqHeaders["if-none-match"];

  if (ifNoneMatch(ifNone, etag)) {
    return {
      status: 304,
      headers: {
        ETag: etag,
        ...(lastModified && { "Last-Modified": lastModified.toUTCString() }),
      },
    };
  }

  return {
    status: 200,
    headers: {
      ETag: etag,
      ...(lastModified && { "Last-Modified": lastModified.toUTCString() }),
    },
  };
}

export async function fileETag(filePath: string): Promise<string> {
  const s = await statAsync(filePath);
  return weakETag(s.size, s.mtime.getTime());
}

export default { strongETag, weakETag, ifNoneMatch, decide, fileETag };
