export function deepMerge<T extends Record<string, unknown>>(defaults: T, override: Partial<T> | null | undefined): T {
  if (!override) return defaults;

  const result = { ...defaults };

  for (const key of Object.keys(override) as Array<keyof T>) {
    const defaultValue = defaults[key];
    const overrideValue = override[key];

    if (overrideValue === undefined) continue;

    if (
      defaultValue &&
      overrideValue &&
      typeof defaultValue === 'object' &&
      typeof overrideValue === 'object' &&
      !Array.isArray(defaultValue) &&
      !Array.isArray(overrideValue)
    ) {
      result[key] = deepMerge(
        defaultValue as Record<string, unknown>,
        overrideValue as Record<string, unknown>,
      ) as T[keyof T];
    } else {
      result[key] = overrideValue as T[keyof T];
    }
  }

  return result;
}
