type DeepPartial<T> =
  T extends (...args: infer Args) => infer Return ? (...args: Args) => Return
  : T extends Array<infer Item> ? Array<DeepPartial<Item>>
  : T extends object ? { [Key in keyof T]?: DeepPartial<T[Key]> }
  : T

export function mergeMessages<T>(base: T, override: DeepPartial<T> | undefined): T {
  if (!override) {
    return base
  }
  if (typeof base !== 'object' || base === null) {
    return (override as T) ?? base
  }
  if (Array.isArray(base)) {
    return (override as T) ?? base
  }

  const result: Record<string, unknown> = { ...(base as Record<string, unknown>) }
  for (const [key, value] of Object.entries(override as Record<string, unknown>)) {
    const current = result[key]
    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      current &&
      typeof current === 'object' &&
      !Array.isArray(current)
    ) {
      result[key] = mergeMessages(
        current as Record<string, unknown>,
        value as Record<string, unknown>,
      )
    } else {
      result[key] = value
    }
  }
  return result as T
}
