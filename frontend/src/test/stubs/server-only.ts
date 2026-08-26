// Stub for 'server-only' package in test environment
// This prevents the "server-only" error when importing server-side modules in tests
// The actual server-only package throws if imported in a non-RSC context.
// In tests, we just export an empty module.
export {};
