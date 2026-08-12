# etag-generator

ETag generation and If-None-Match comparison for HTTP caching per RFC 7232.

## Quick Start

```typescript
import { strongETag, decide } from "etag-generator";

const content = "page content";
const etag = strongETag(content);

const result = decide(req.headers, etag);
// → { status: 304, headers: { ETag: "..." } } if cached
```

## API

### `strongETag(content: string | Buffer): string`

Generate strong ETag from content (SHA256, first 27 base64url chars).

### `weakETag(size: number, mtime: number): string`

Generate weak ETag from file size and mtime (for file-based caching).

### `ifNoneMatch(header: string | undefined, etag: string): boolean`

Check If-None-Match header against ETag (handles W/ prefix and * wildcard per RFC 7232).

### `decide(reqHeaders, etag, lastModified?): { status, headers }`

Evaluate conditional request headers; returns 304 if matched, 200 with caching headers otherwise.

### `fileETag(filePath: string): Promise<string>`

Async helper to generate weak ETag from file stats.

## Limits

- Strong ETags use SHA256 first 27 base64url chars (not full hash)
- Weak ETags can change despite identical content (mtime-based)
- No Last-Modified evaluation

---

Part of the [ferrow-toolkit](https://github.com/Ruzylo-cloud/ferrow-toolkit) collection · Sponsored by [Ferrow](https://ferrow.ai)
