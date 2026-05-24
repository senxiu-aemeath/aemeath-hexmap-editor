import type { WorldDocument } from '../../domain/world'
import {
  humanizeIconKey,
  inferIconKind,
  type UserIconDefinition,
} from './iconRegistry'

export function normalizeUserIconDefinitions(input: unknown): UserIconDefinition[] {
  if (!Array.isArray(input)) {
    return []
  }

  return input.flatMap((entry) => {
    if (
      !entry ||
      typeof entry !== 'object' ||
      typeof entry.key !== 'string' ||
      typeof entry.src !== 'string'
    ) {
      return []
    }

    const key = entry.key.trim()
    const src = entry.src.trim()
    const label =
      typeof entry.label === 'string' && entry.label.trim()
        ? entry.label.trim()
        : humanizeIconKey(key)
    const tags = Array.isArray(entry.tags)
      ? entry.tags.filter((tag: unknown): tag is string => typeof tag === 'string')
      : undefined
    const kind =
      typeof entry.kind === 'string' && entry.kind.trim()
        ? entry.kind.trim()
        : inferIconKind(src)
    const uploadedAt =
      typeof entry.uploadedAt === 'number' && Number.isFinite(entry.uploadedAt)
        ? entry.uploadedAt
        : 1
    return key && src ? [{ key, src, label, tags, kind, uploadedAt }] : []
  })
}

export function replaceIconReferences(
  world: WorldDocument,
  previousKey: string,
  nextKey: string | null,
) {
  return {
    ...world,
    cityLevels: Object.fromEntries(
      Object.entries(world.cityLevels).map(([id, level]) => [
        id,
        level.iconKey === previousKey
          ? { ...level, iconKey: nextKey ?? level.iconKey }
          : level,
      ]),
    ),
    countries: Object.fromEntries(
      Object.entries(world.countries).map(([id, country]) => [
        id,
        country.iconKey === previousKey
          ? { ...country, iconKey: nextKey }
          : country,
      ]),
    ),
  }
}

export function cloneUserIcons(icons: UserIconDefinition[]) {
  return icons.map((icon) => ({
    ...icon,
    tags: icon.tags ? [...icon.tags] : undefined,
  }))
}

export function getProjectExportUserIcons(
  icons: UserIconDefinition[],
  includeEmbeddedIcons: boolean,
): UserIconDefinition[] {
  const cloned = cloneUserIcons(icons)
  if (includeEmbeddedIcons) {
    return cloned
  }
  return cloned.filter((icon) => !icon.src.trim().toLowerCase().startsWith('data:'))
}

export function cloneWorldDocument(world: WorldDocument) {
  return structuredClone(world)
}

export function restoreSelectedIconReferences(
  currentWorld: WorldDocument,
  snapshotWorld: WorldDocument,
  currentKey: string,
  snapshotKey: string,
) {
  return {
    ...currentWorld,
    cityLevels: Object.fromEntries(
      Object.entries(currentWorld.cityLevels).map(([id, level]) => {
        const snapshotLevel = snapshotWorld.cityLevels[id]
        const snapshotIconKey = snapshotLevel?.iconKey ?? level.iconKey
        if (level.iconKey !== currentKey && snapshotIconKey !== snapshotKey) {
          return [id, level]
        }
        return [
          id,
          {
            ...level,
            iconKey: snapshotIconKey,
          },
        ]
      }),
    ),
    countries: Object.fromEntries(
      Object.entries(currentWorld.countries).map(([id, country]) => {
        const snapshotCountry = snapshotWorld.countries[id]
        const snapshotIconKey = snapshotCountry?.iconKey ?? country.iconKey
        if (country.iconKey !== currentKey && snapshotIconKey !== snapshotKey) {
          return [id, country]
        }
        return [
          id,
          {
            ...country,
            iconKey: snapshotIconKey,
          },
        ]
      }),
    ),
  }
}
