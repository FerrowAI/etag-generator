const { strongETag, weakETag, ifNoneMatch, decide } = require("../dist/index");

// Demo: strong etag from content
const content = "Hello, World!";
const etag1 = strongETag(content);
const etag2 = strongETag(content);
console.log("Strong ETags for same content:");
console.log("  First:  " + etag1);
console.log("  Second: " + etag2);
console.log("  Match:", etag1 === etag2);

// Demo: weak etag
const weak = weakETag(1024, Date.now());
console.log("\nWeak ETag:", weak);

// Demo: If-None-Match matching
console.log("\nIf-None-Match comparison:");
console.log('  "abc" matches "abc":', ifNoneMatch('"abc"', '"abc"'));
console.log("  W/\" abc\" matches \"abc\":", ifNoneMatch('W/"abc"', '"abc"'));
console.log(
  '  "abc" matches "*" (wildcard):',
  ifNoneMatch('"*"', '"abc"')
);

// Demo: decide() for 200 vs 304
const headers304 = {
  "if-none-match": etag1,
};
const result304 = decide(headers304, etag1);
console.log("\nDecide with matching ETag:");
console.log("  Status:", result304.status); // 304
console.log("  Headers:", result304.headers);

const headers200 = {
  "if-none-match": '"different"',
};
const result200 = decide(headers200, etag1);
console.log("\nDecide with different ETag:");
console.log("  Status:", result200.status); // 200
console.log("  Headers:", result200.headers);
