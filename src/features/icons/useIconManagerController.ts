import type { ChangeEvent, Dispatch, MutableRefObject, SetStateAction } from 'react'

import { CITY_ICON_REGISTRY, type WorldDocument } from '../../domain/world'
import {
  humanizeIconKey,
  inferIconKind,
  resolveUniqueIconKey,
  type IconRegistryEntry,
  type UserIconDefinition,
} from './iconRegistry'

type ExpandedTableId =
  | 'cities'
  | 'countries'
  | 'provinces'
  | 'label-groups'
  | 'text-labels'
  | 'icon-labels'
  | 'icons'
  | 'fonts'
  | null

export interface IconManagerSessionSnapshot {
  userIcons: UserIconDefinition[]
  world: WorldDocument
  countryDraftIconKey: string | null
  cityLevelDraftIconKey: string
}

interface UseIconManagerControllerArgs {
  state: {
    cityLevelDraftIconKey: string
    countryDraftIconKey: string | null
    defaultIconKey: string
    iconRegistryEntries: IconRegistryEntry[]
    iconSourceMap: Record<string, string>
    iconUsageCountByKey: Record<string, number>
    selectedIconManagerKey: string | null
    userIcons: UserIconDefinition[]
    world: WorldDocument
  }
  refs: {
    iconManagerOriginKeyByCurrentRef: MutableRefObject<Record<string, string>>
    iconManagerSessionSnapshotRef: MutableRefObject<IconManagerSessionSnapshot | null>
  }
  actions: {
    cloneUserIcons: (icons: UserIconDefinition[]) => UserIconDefinition[]
    cloneWorldDocument: (world: WorldDocument) => WorldDocument
    replaceIconReferences: (
      world: WorldDocument,
      previousKey: string,
      nextKey: string | null,
    ) => WorldDocument
    restoreSelectedIconReferences: (
      currentWorld: WorldDocument,
      snapshotWorld: WorldDocument,
      currentKey: string,
      snapshotKey: string,
    ) => WorldDocument
    setCityLevelDraftIconKey: Dispatch<SetStateAction<string>>
    setCountryDraftIconKey: Dispatch<SetStateAction<string | null>>
    setExpandedTableId: Dispatch<SetStateAction<ExpandedTableId>>
    setIconManagerSearch: Dispatch<SetStateAction<string>>
    setIconManagerTagFilter: Dispatch<SetStateAction<string | null>>
    setIsBrandDockOpen: Dispatch<SetStateAction<boolean>>
    setIsConfigDockOpen: Dispatch<SetStateAction<boolean>>
    setIsProjectDockOpen: Dispatch<SetStateAction<boolean>>
    setSelectedIconManagerKey: Dispatch<SetStateAction<string | null>>
    setUserIcons: Dispatch<SetStateAction<UserIconDefinition[]>>
    setWorld: Dispatch<SetStateAction<WorldDocument>>
  }
}

export function useIconManagerController({
  state,
  refs,
  actions,
}: UseIconManagerControllerArgs) {
  const {
    cityLevelDraftIconKey,
    countryDraftIconKey,
    defaultIconKey,
    iconRegistryEntries,
    iconSourceMap,
    iconUsageCountByKey,
    selectedIconManagerKey,
    userIcons,
    world,
  } = state
  const {
    iconManagerOriginKeyByCurrentRef,
    iconManagerSessionSnapshotRef,
  } = refs
  const {
    cloneUserIcons,
    cloneWorldDocument,
    replaceIconReferences,
    restoreSelectedIconReferences,
    setCityLevelDraftIconKey,
    setCountryDraftIconKey,
    setExpandedTableId,
    setIconManagerSearch,
    setIconManagerTagFilter,
    setIsBrandDockOpen,
    setIsConfigDockOpen,
    setIsProjectDockOpen,
    setSelectedIconManagerKey,
    setUserIcons,
    setWorld,
  } = actions

  const ensureIconManagerSessionSnapshot = () => {
    if (iconManagerSessionSnapshotRef.current) {
      return
    }

    iconManagerSessionSnapshotRef.current = {
      userIcons: cloneUserIcons(userIcons),
      world: cloneWorldDocument(world),
      countryDraftIconKey,
      cityLevelDraftIconKey,
    }
    iconManagerOriginKeyByCurrentRef.current = Object.fromEntries(
      iconRegistryEntries.map((entry) => [entry.key, entry.key]),
    )
  }

  const closeBrandDockPanels = () => {
    setIsBrandDockOpen(false)
    setIsProjectDockOpen(false)
    setIsConfigDockOpen(false)
  }

  const handleUploadIconFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) {
      return
    }

    const uniqueKey = resolveUniqueIconKey(
      file.name.replace(/\.[^.]+$/, ''),
      iconRegistryEntries.map((entry) => entry.key),
    )
    if (!uniqueKey) {
      return
    }

    const src = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result)
          return
        }
        reject(new Error('Invalid icon file'))
      }
      reader.onerror = () => {
        reject(reader.error ?? new Error('Failed to read icon file'))
      }
      reader.readAsDataURL(file)
    }).catch(() => null)

    if (!src) {
      return
    }

    ensureIconManagerSessionSnapshot()

    setUserIcons((current) => [
      ...current,
      {
        key: uniqueKey,
        src,
        label: humanizeIconKey(uniqueKey),
        tags: ['custom'],
        kind: inferIconKind(file.name || file.type),
        uploadedAt: Date.now(),
      },
    ])
    setExpandedTableId('icons')
    setIconManagerSearch(uniqueKey)
    setSelectedIconManagerKey(uniqueKey)
  }

  const handleRemoveUserIcon = (iconKey: string) => {
    if (iconUsageCountByKey[iconKey]) {
      return
    }

    setUserIcons((current) => current.filter((icon) => icon.key !== iconKey))
    if (selectedIconManagerKey === iconKey) {
      setSelectedIconManagerKey(null)
    }
    if (countryDraftIconKey === iconKey) {
      setCountryDraftIconKey(null)
    }
    if (cityLevelDraftIconKey === iconKey) {
      setCityLevelDraftIconKey(defaultIconKey)
    }
  }

  const handleUpdateUserIconLabel = (iconKey: string, nextLabel: string) => {
    setUserIcons((current) =>
      current.some((icon) => icon.key === iconKey)
        ? current.map((icon) =>
            icon.key === iconKey
              ? { ...icon, label: nextLabel.trim() || humanizeIconKey(icon.key) }
              : icon,
          )
        : [
            ...current,
            {
              key: iconKey,
              src: iconSourceMap[iconKey] ?? '',
              label: nextLabel.trim() || humanizeIconKey(iconKey),
              tags: iconRegistryEntries.find((entry) => entry.key === iconKey)?.tags,
              kind: iconRegistryEntries.find((entry) => entry.key === iconKey)?.kind,
              uploadedAt: 0,
            },
          ],
    )
  }

  const handleUpdateUserIconTags = (iconKey: string, rawTags: string) => {
    const nextTags = rawTags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)

    setUserIcons((current) =>
      current.some((icon) => icon.key === iconKey)
        ? current.map((icon) =>
            icon.key === iconKey
              ? { ...icon, tags: nextTags }
              : icon,
          )
        : [
            ...current,
            {
              key: iconKey,
              src: iconSourceMap[iconKey] ?? '',
              label:
                iconRegistryEntries.find((entry) => entry.key === iconKey)?.label ??
                humanizeIconKey(iconKey),
              tags: nextTags,
              kind: iconRegistryEntries.find((entry) => entry.key === iconKey)?.kind,
              uploadedAt: 0,
            },
          ],
    )
  }

  const handleRenameUserIconKey = (previousKey: string, rawNextKey: string) => {
    const nextKey = resolveUniqueIconKey(
      rawNextKey,
      iconRegistryEntries
        .map((entry) => entry.key)
        .filter((key) => key !== previousKey),
    )
    if (!nextKey || nextKey === previousKey) {
      return
    }

    setUserIcons((current) =>
      current.map((icon) =>
        icon.key === previousKey
          ? { ...icon, key: nextKey }
          : icon,
      ),
    )
    setWorld((current) => replaceIconReferences(current, previousKey, nextKey))
    iconManagerOriginKeyByCurrentRef.current = {
      ...iconManagerOriginKeyByCurrentRef.current,
      [nextKey]: iconManagerOriginKeyByCurrentRef.current[previousKey] ?? previousKey,
    }
    delete iconManagerOriginKeyByCurrentRef.current[previousKey]
    if (countryDraftIconKey === previousKey) {
      setCountryDraftIconKey(nextKey)
    }
    if (cityLevelDraftIconKey === previousKey) {
      setCityLevelDraftIconKey(nextKey)
    }
    if (selectedIconManagerKey === previousKey) {
      setSelectedIconManagerKey(nextKey)
    }
  }

  const handleOpenIconManager = () => {
    ensureIconManagerSessionSnapshot()
    setExpandedTableId('icons')
    closeBrandDockPanels()
    setIconManagerTagFilter(null)
  }

  const handleOpenFontLookupPanel = () => {
    setExpandedTableId((current) => {
      if (current === 'icons') {
        iconManagerSessionSnapshotRef.current = null
        iconManagerOriginKeyByCurrentRef.current = {}
      }
      return current === 'fonts' ? null : 'fonts'
    })
    closeBrandDockPanels()
  }

  const handleRestoreBuiltInIcon = (iconKey: string) => {
    setUserIcons((current) => current.filter((icon) => icon.key !== iconKey))
  }

  const handleRevertSelectedIcon = () => {
    const snapshot = iconManagerSessionSnapshotRef.current
    if (!snapshot || !selectedIconManagerKey) {
      return
    }

    const currentKey = selectedIconManagerKey
    const snapshotKey = iconManagerOriginKeyByCurrentRef.current[currentKey] ?? currentKey
    const snapshotUserIcon = snapshot.userIcons.find((icon) => icon.key === snapshotKey)
    const snapshotBuiltInExists = CITY_ICON_REGISTRY[snapshotKey] !== undefined

    setUserIcons((current) => {
      const withoutCurrent = current.filter((icon) => icon.key !== currentKey && icon.key !== snapshotKey)
      if (snapshotUserIcon) {
        return [...withoutCurrent, cloneUserIcons([snapshotUserIcon])[0]]
      }
      return withoutCurrent
    })
    setWorld((current) =>
      restoreSelectedIconReferences(current, snapshot.world, currentKey, snapshotKey),
    )

    if (countryDraftIconKey === currentKey || snapshot.countryDraftIconKey === snapshotKey) {
      setCountryDraftIconKey(snapshot.countryDraftIconKey)
    }
    if (cityLevelDraftIconKey === currentKey || snapshot.cityLevelDraftIconKey === snapshotKey) {
      setCityLevelDraftIconKey(snapshot.cityLevelDraftIconKey)
    }

    const nextSelectedKey = snapshotUserIcon || snapshotBuiltInExists ? snapshotKey : null
    const nextOriginMap = { ...iconManagerOriginKeyByCurrentRef.current }
    delete nextOriginMap[currentKey]
    if (nextSelectedKey) {
      nextOriginMap[nextSelectedKey] = nextSelectedKey
    }
    iconManagerOriginKeyByCurrentRef.current = nextOriginMap
    setSelectedIconManagerKey(nextSelectedKey)
  }

  return {
    handleUploadIconFile,
    handleRemoveUserIcon,
    handleUpdateUserIconLabel,
    handleUpdateUserIconTags,
    handleRenameUserIconKey,
    handleOpenIconManager,
    handleOpenFontLookupPanel,
    handleRestoreBuiltInIcon,
    handleRevertSelectedIcon,
  }
}
