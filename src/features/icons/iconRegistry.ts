import { CITY_ICON_REGISTRY } from '../../domain/world'

export interface UserIconDefinition {
  key: string
  src: string
  label?: string
  tags?: string[]
  kind?: string
  uploadedAt?: number
}

export interface IconRegistryEntry {
  key: string
  src: string
  builtIn: boolean
  label: string
  tags: string[]
  kind: string
  uploadedAt: number
}

export function getBuiltInIconEntries(): IconRegistryEntry[] {
  return Object.entries(CITY_ICON_REGISTRY).map(([key, src]) => ({
    key,
    src,
    builtIn: true,
    label: humanizeIconKey(key),
    tags: ['built-in', 'city'],
    kind: inferIconKind(src),
    uploadedAt: 0,
  }))
}

export function mergeIconRegistry(userIcons: UserIconDefinition[]): IconRegistryEntry[] {
  const entries = [...getBuiltInIconEntries()]
  const entryByKey = new Map(entries.map((entry) => [entry.key, entry]))

  for (const icon of userIcons) {
    if (!icon.key) {
      continue
    }
    const existing = entryByKey.get(icon.key)
    if (existing?.builtIn) {
      const merged = {
        ...existing,
        label: icon.label?.trim() || existing.label,
        tags: normalizeIconTags(icon.tags).filter((tag) => tag !== 'custom'),
        kind: icon.kind?.trim() || existing.kind,
      }
      entryByKey.set(icon.key, merged)
      const index = entries.findIndex((entry) => entry.key === icon.key)
      if (index !== -1) {
        entries[index] = merged
      }
      continue
    }
    if (existing) {
      continue
    }
    entries.push({
      key: icon.key,
      src: icon.src,
      builtIn: false,
      label: icon.label?.trim() || humanizeIconKey(icon.key),
      tags: normalizeIconTags(icon.tags),
      kind: icon.kind?.trim() || inferIconKind(icon.src),
      uploadedAt: typeof icon.uploadedAt === 'number' ? icon.uploadedAt : 1,
    })
    entryByKey.set(icon.key, entries[entries.length - 1])
  }

  return entries
}

export function createIconSourceMap(entries: IconRegistryEntry[]) {
  return Object.fromEntries(entries.map((entry) => [entry.key, entry.src])) as Record<string, string>
}

export function sanitizeIconKey(rawValue: string) {
  return rawValue
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function resolveUniqueIconKey(rawValue: string, existingKeys: Iterable<string>) {
  const baseKey = sanitizeIconKey(rawValue)
  if (!baseKey) {
    return ''
  }

  const usedKeys = new Set(existingKeys)
  if (!usedKeys.has(baseKey)) {
    return baseKey
  }

  let suffix = 2
  let candidate = `${baseKey}-${suffix}`
  while (usedKeys.has(candidate)) {
    suffix += 1
    candidate = `${baseKey}-${suffix}`
  }
  return candidate
}

export function normalizeIconTags(tags: string[] | undefined) {
  if (!tags) {
    return ['custom']
  }

  const normalized = tags
    .map((tag) => sanitizeIconKey(tag))
    .filter(Boolean)

  if (!normalized.includes('custom')) {
    normalized.unshift('custom')
  }

  return Array.from(new Set(normalized))
}

export function humanizeIconKey(key: string) {
  const normalized = key.trim().replace(/[_-]+/g, ' ')
  if (!normalized) {
    return ''
  }
  return normalized.replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export function inferIconKind(value: string) {
  const normalized = value.toLowerCase()
  if (normalized.includes('image/svg+xml') || normalized.endsWith('.svg')) {
    return 'svg'
  }
  if (normalized.includes('image/png') || normalized.endsWith('.png')) {
    return 'png'
  }
  if (normalized.includes('image/webp') || normalized.endsWith('.webp')) {
    return 'webp'
  }
  if (
    normalized.includes('image/jpeg') ||
    normalized.includes('image/jpg') ||
    normalized.endsWith('.jpg') ||
    normalized.endsWith('.jpeg')
  ) {
    return 'jpg'
  }
  return 'image'
}
