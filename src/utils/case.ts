/**
 * Convert object keys from camelCase to snake_case
 */
export function toSnakeCase(obj: object): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    result[key.replace(/[A-Z]/g, c => '_' + c.toLowerCase())] = value
  }
  return result
}

/**
 * Convert object keys from snake_case to camelCase
 */
export function toCamelCase(obj: object): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    result[key.replace(/_([a-z])/g, (_, c) => c.toUpperCase())] = value
  }
  return result
}
