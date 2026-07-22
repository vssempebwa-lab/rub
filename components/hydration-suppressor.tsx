'use client';

/**
 * Suppresses hydration mismatch warnings caused by browser extensions
 * like BIS (Browser Integrity Server) that inject attributes into the DOM
 * This runs at module load time, before React mounts
 */

if (typeof window !== 'undefined') {
  const originalError = console.error;
  console.error = (...args: any[]) => {
    const firstArg = args[0];
    const secondArg = args[1];
    
    // Suppress hydration mismatch warnings from extensions
    if (
      typeof firstArg === 'string' &&
      (firstArg.includes('hydrated') ||
        firstArg.includes('Hydration') ||
        firstArg.includes('bis_') ||
        firstArg.includes('tree hydrated'))
    ) {
      return;
    }

    // Check second argument for hydration errors
    if (
      typeof secondArg === 'string' &&
      (secondArg.includes('bis_') || secondArg.includes('hydrated'))
    ) {
      return;
    }

    originalError(...args);
  };
}

export function HydrationSuppressor() {
  return null;
}
