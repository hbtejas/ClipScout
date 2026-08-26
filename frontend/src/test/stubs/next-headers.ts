// Stub for 'next/headers' in test environment (jsdom)
// The real next/headers throws unless running in App Router context.
// Tests mock the full Supabase client anyway, so this stub just needs to not crash.

export function cookies() {
  return {
    getAll: () => [] as { name: string; value: string }[],
    set: (_name: string, _value: string, _options?: unknown) => {},
  };
}

export function headers() {
  return new Headers();
}
