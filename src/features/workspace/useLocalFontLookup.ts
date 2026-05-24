import { type Dispatch, type SetStateAction, useMemo } from 'react'

import type { AppMessages } from '../../i18n'
import { copyTextToClipboard } from '../../utils/clipboard'
import type { LocalFontLookupEntry, LocalFontLookupStatus } from './useUiPreferences'

export function useLocalFontLookup(args: {
  localFontLookupStatus: LocalFontLookupStatus
  setLocalFontLookupStatus: Dispatch<SetStateAction<LocalFontLookupStatus>>
  localFontLookupEntries: LocalFontLookupEntry[]
  setLocalFontLookupEntries: Dispatch<SetStateAction<LocalFontLookupEntry[]>>
  localFontLookupError: string | null
  setLocalFontLookupError: Dispatch<SetStateAction<string | null>>
  localFontLookupFilter: string
  setLocalFontLookupFilter: Dispatch<SetStateAction<string>>
  localFontCopyError: string | null
  setLocalFontCopyError: Dispatch<SetStateAction<string | null>>
  recentlyCopiedFontFamily: string | null
  setRecentlyCopiedFontFamily: Dispatch<SetStateAction<string | null>>
  ui: AppMessages
}) {
  const {
    localFontLookupStatus,
    setLocalFontLookupStatus,
    localFontLookupEntries,
    setLocalFontLookupEntries,
    localFontLookupError,
    setLocalFontLookupError,
    localFontLookupFilter,
    setLocalFontLookupFilter,
    localFontCopyError,
    setLocalFontCopyError,
    recentlyCopiedFontFamily,
    setRecentlyCopiedFontFamily,
    ui,
  } = args

  const localFontLookupStatusText = useMemo(() => {
    if (localFontLookupStatus === 'loading') {
      return ui.common.localFontLookupLoading
    }
    if (localFontLookupStatus === 'unsupported') {
      return ui.common.localFontLookupUnavailable
    }
    if (localFontLookupStatus === 'blocked') {
      return ui.common.localFontLookupBlocked
    }
    if (localFontLookupStatus === 'ready') {
      return ui.common.localFontLookupLoaded(localFontLookupEntries.length)
    }
    if (localFontLookupStatus === 'error') {
      return localFontLookupError ? `${ui.common.localFontLookupError} (${localFontLookupError})` : ui.common.localFontLookupError
    }
    return ui.common.localFontLookupHint
  }, [localFontLookupEntries.length, localFontLookupError, localFontLookupStatus, ui])

  const filteredLocalFontLookupEntries = useMemo(() => {
    const normalizedFilter = localFontLookupFilter.trim().toLowerCase()
    if (!normalizedFilter) {
      return localFontLookupEntries
    }
    return localFontLookupEntries.filter((entry) =>
      entry.keywords.some((keyword) => keyword.includes(normalizedFilter)),
    )
  }, [localFontLookupEntries, localFontLookupFilter])

  const handleQueryLocalFonts = async () => {
    if (typeof window === 'undefined') {
      return
    }

    const queryLocalFontsApi = (
      window as Window & {
        queryLocalFonts?: () => Promise<Array<{
          family?: string | null
          fullName?: string | null
          postscriptName?: string | null
        }>>
      }
    ).queryLocalFonts

    if (!queryLocalFontsApi) {
      setLocalFontLookupStatus('unsupported')
      setLocalFontLookupError(null)
      return
    }

    setLocalFontLookupStatus('loading')
    setLocalFontLookupError(null)
    setLocalFontCopyError(null)
    setRecentlyCopiedFontFamily(null)
    try {
      const localFonts = await queryLocalFontsApi()
      const familyAliasMap = new Map<string, Set<string>>()

      for (const font of localFonts) {
        const family = typeof font.family === 'string' ? font.family.trim() : ''
        if (!family) {
          continue
        }

        const aliasSet = familyAliasMap.get(family) ?? new Set<string>()
        aliasSet.add(family)

        const fullName = typeof font.fullName === 'string' ? font.fullName.trim() : ''
        if (fullName) {
          aliasSet.add(fullName)
        }

        const postscriptName =
          typeof font.postscriptName === 'string' ? font.postscriptName.trim() : ''
        if (postscriptName) {
          aliasSet.add(postscriptName)
        }

        familyAliasMap.set(family, aliasSet)
      }

      const entries = Array.from(familyAliasMap.entries())
        .map(([family, aliasSet]) => {
          const aliases = Array.from(aliasSet).filter((alias) => alias !== family)
          const keywords = [family, ...aliases].map((value) => value.toLowerCase())
          return {
            family,
            aliases,
            keywords,
          } satisfies LocalFontLookupEntry
        })
        .sort((left, right) => left.family.localeCompare(right.family))

      setLocalFontLookupEntries(entries)
      setLocalFontLookupStatus('ready')
    } catch (error) {
      const errorName =
        error && typeof error === 'object' && 'name' in error
          ? String((error as { name?: unknown }).name ?? '')
          : ''
      const errorMessage = error instanceof Error ? error.message : ''
      const blocked = errorName === 'NotAllowedError' || /denied|permission|not allowed/i.test(errorMessage)
      setLocalFontLookupStatus(blocked ? 'blocked' : 'error')
      setLocalFontLookupError(errorMessage || null)
    }
  }

  const handleRescanLocalFonts = async () => {
    setLocalFontLookupEntries([])
    setLocalFontLookupFilter('')
    setLocalFontLookupStatus('idle')
    setLocalFontLookupError(null)
    await handleQueryLocalFonts()
  }

  const handleCopyFontFamily = async (fontFamily: string) => {
    setLocalFontCopyError(null)
    const copied = await copyTextToClipboard(fontFamily)
    if (!copied) {
      setLocalFontCopyError(ui.common.localFontLookupCopyError)
      return
    }
    setRecentlyCopiedFontFamily(fontFamily)
    if (typeof window !== 'undefined') {
      window.setTimeout(() => {
        setRecentlyCopiedFontFamily((current) => (current === fontFamily ? null : current))
      }, 1200)
    }
  }

  // Suppress unused-variable warnings for passthrough parameters that are only
  // consumed by the functions above (not referenced in useMemo deps directly).
  void localFontCopyError
  void recentlyCopiedFontFamily

  return {
    localFontLookupStatusText,
    filteredLocalFontLookupEntries,
    handleQueryLocalFonts,
    handleRescanLocalFonts,
    handleCopyFontFamily,
  }
}
