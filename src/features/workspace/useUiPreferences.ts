import { useState } from 'react'

import type { UiLanguageId } from '../../i18n_multilingual_latest'
import { DEFAULT_THEME } from '../../theme'

type LocalFontLookupStatus = 'idle' | 'loading' | 'ready' | 'unsupported' | 'blocked' | 'error'
type LocalFontLookupEntry = {
  family: string
  aliases: string[]
  keywords: string[]
}

export function useUiPreferences() {
  const [activeUiLanguage, setActiveUiLanguage] = useState<UiLanguageId>('en')
  const [activeThemeId, setActiveThemeId] = useState(DEFAULT_THEME.id)
  const [fontFamilyOverride, setFontFamilyOverride] = useState('')
  const [westernSidebarNameScale, setWesternSidebarNameScale] = useState(1)
  const [chineseSidebarNameScale, setChineseSidebarNameScale] = useState(0.82)
  const [uiIconInvert, setUiIconInvert] = useState(DEFAULT_THEME.uiIconInvert)
  const [localFontLookupStatus, setLocalFontLookupStatus] = useState<LocalFontLookupStatus>('idle')
  const [localFontLookupEntries, setLocalFontLookupEntries] = useState<LocalFontLookupEntry[]>([])
  const [localFontLookupError, setLocalFontLookupError] = useState<string | null>(null)
  const [localFontLookupFilter, setLocalFontLookupFilter] = useState('')
  const [localFontCopyError, setLocalFontCopyError] = useState<string | null>(null)
  const [recentlyCopiedFontFamily, setRecentlyCopiedFontFamily] = useState<string | null>(null)
  const [previewCellsPerFrame, setPreviewCellsPerFrame] = useState(24)
  const [embedIconsInProjectFile, setEmbedIconsInProjectFile] = useState(true)

  return {
    activeUiLanguage, setActiveUiLanguage,
    activeThemeId, setActiveThemeId,
    fontFamilyOverride, setFontFamilyOverride,
    westernSidebarNameScale, setWesternSidebarNameScale,
    chineseSidebarNameScale, setChineseSidebarNameScale,
    uiIconInvert, setUiIconInvert,
    localFontLookupStatus, setLocalFontLookupStatus,
    localFontLookupEntries, setLocalFontLookupEntries,
    localFontLookupError, setLocalFontLookupError,
    localFontLookupFilter, setLocalFontLookupFilter,
    localFontCopyError, setLocalFontCopyError,
    recentlyCopiedFontFamily, setRecentlyCopiedFontFamily,
    previewCellsPerFrame, setPreviewCellsPerFrame,
    embedIconsInProjectFile, setEmbedIconsInProjectFile,
  }
}

export type UiPreferencesState = ReturnType<typeof useUiPreferences>
export type { LocalFontLookupStatus, LocalFontLookupEntry }
