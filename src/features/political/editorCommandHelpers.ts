import type { Dispatch, SetStateAction } from 'react'

import {
  createAssignedLabelForGroup,
  createCityLevel,
  createCountry,
  createGovernmentType,
  createProvince,
  removeCityLevel,
  removeCountry,
  removeGovernmentType,
  removeProvince,
  upsertCityLevel,
  upsertCountry,
  upsertGovernmentType,
  upsertLabel,
  upsertProvince,
  type LabelGroup,
  type Province,
  type WorldDocument,
} from '../../domain/world'
import { openCityEditor } from './editors/objectEditorOpeners'

function appendDraftAssignedLabels(
  world: WorldDocument,
  labelGroups: LabelGroup[],
  labelDrafts: Record<string, boolean>,
  targetId: string,
) {
  let nextWorld = world

  for (const group of labelGroups) {
    if (!labelDrafts[group.id]) {
      continue
    }
    const nextLabel = createAssignedLabelForGroup(nextWorld, group.id, targetId)
    if (!nextLabel) {
      continue
    }
    nextWorld = upsertLabel(nextWorld, nextLabel)
  }

  return nextWorld
}

export function openProvinceCapitalCityState(args: {
  closeProvinceEditorWithPreviewReset: () => void
  provinceDraftCapitalCityId: string
  setCityAssignedLabelDrafts: Dispatch<SetStateAction<Record<string, boolean>>>
  setCityDraftCountryId: Dispatch<SetStateAction<string>>
  setCityDraftDescription: Dispatch<SetStateAction<string>>
  setCityDraftLevelId: Dispatch<SetStateAction<string>>
  setCityDraftName: Dispatch<SetStateAction<string>>
  setCityDraftSecondName: Dispatch<SetStateAction<string>>
  setEditingCityId: Dispatch<SetStateAction<string | null>>
  setIsCityEditorOpen: Dispatch<SetStateAction<boolean>>
  setPendingCityCellId: Dispatch<SetStateAction<string | null>>
  world: WorldDocument
}) {
  const capitalCity = args.world.cities[args.provinceDraftCapitalCityId]
  if (!capitalCity) {
    return
  }

  args.closeProvinceEditorWithPreviewReset()
  openCityEditor(
    capitalCity,
    args.setIsCityEditorOpen,
    args.setEditingCityId,
    args.setPendingCityCellId,
    args.setCityDraftName,
    args.setCityDraftSecondName,
    args.setCityDraftCountryId,
    args.setCityDraftLevelId,
    args.setCityDraftDescription,
    args.setCityAssignedLabelDrafts,
  )
}

export function deleteEditingProvinceState(args: {
  activeProvinceId: string | null
  closeProvinceEditorWithPreviewReset: () => void
  editingProvinceId: string | null
  setActiveProvinceId: Dispatch<SetStateAction<string | null>>
  setWorld: Dispatch<SetStateAction<WorldDocument>>
}) {
  if (!args.editingProvinceId) {
    return
  }

  args.setWorld((current) => removeProvince(current, args.editingProvinceId!))
  if (args.activeProvinceId === args.editingProvinceId) {
    args.setActiveProvinceId(null)
  }
  args.closeProvinceEditorWithPreviewReset()
}

export function saveProvinceEditorState(args: {
  closeProvinceEditorWithPreviewReset: () => void
  editingProvince: Province | null
  editingProvinceId: string | null
  provinceAssignedLabelDrafts: Record<string, boolean>
  provinceAssignedLabelGroups: LabelGroup[]
  provinceDraftCapitalCityId: string
  provinceDraftColor: string
  provinceDraftCountryId: string
  provinceDraftDescription: string
  provinceDraftName: string
  setActiveCountryId: Dispatch<SetStateAction<string | null>>
  setActiveProvinceId: Dispatch<SetStateAction<string | null>>
  setWorld: Dispatch<SetStateAction<WorldDocument>>
}) {
  const trimmedName = args.provinceDraftName.trim()
  if (!trimmedName) {
    return
  }

  const nextCountryId =
    args.provinceDraftCountryId === 'unassigned' ? null : args.provinceDraftCountryId
  const nextCapitalCityId =
    args.provinceDraftCapitalCityId === 'none' ? null : args.provinceDraftCapitalCityId

  if (args.editingProvince && args.editingProvinceId) {
    const editingProvince = args.editingProvince

    args.setWorld((current) =>
      upsertProvince(current, {
        ...editingProvince,
        name: trimmedName,
        countryId: nextCountryId,
        color: args.provinceDraftColor,
        capitalCityId: nextCapitalCityId,
        description: args.provinceDraftDescription.trim(),
      }),
    )
    args.setActiveProvinceId(args.editingProvinceId)
    args.setActiveCountryId(nextCountryId)
  } else {
    const nextProvince = createProvince(trimmedName, args.provinceDraftColor, nextCountryId)
    nextProvince.capitalCityId = nextCapitalCityId
    nextProvince.description = args.provinceDraftDescription.trim()

    args.setWorld((current) =>
      appendDraftAssignedLabels(
        upsertProvince(current, nextProvince),
        args.provinceAssignedLabelGroups,
        args.provinceAssignedLabelDrafts,
        nextProvince.id,
      ),
    )
    args.setActiveProvinceId(nextProvince.id)
    args.setActiveCountryId(nextCountryId)
  }

  args.closeProvinceEditorWithPreviewReset()
}

export function deleteEditingCountryState(args: {
  activeCountryId: string | null
  closeCountryEditorWithPreviewReset: () => void
  editingCountryId: string | null
  setActiveCountryId: Dispatch<SetStateAction<string | null>>
  setWorld: Dispatch<SetStateAction<WorldDocument>>
}) {
  if (!args.editingCountryId) {
    return
  }

  args.setWorld((current) => removeCountry(current, args.editingCountryId!))
  if (args.activeCountryId === args.editingCountryId) {
    args.setActiveCountryId(null)
  }
  args.closeCountryEditorWithPreviewReset()
}

export function saveCountryEditorState(args: {
  closeCountryEditorWithPreviewReset: () => void
  countryAssignedLabelDrafts: Record<string, boolean>
  countryAssignedLabelGroups: LabelGroup[]
  countryDraftBorderColor: string
  countryDraftColor: string
  countryDraftDescription: string
  countryDraftGovernmentTypeId: string
  countryDraftIconKey: string | null
  countryDraftIsCityState: boolean
  countryDraftName: string
  countryDraftProvinceBorderColor: string
  countryDraftProvinceDefaultColor: string
  countryDraftSecondName: string
  editingCountryId: string | null
  setActiveCountryId: Dispatch<SetStateAction<string | null>>
  setWorld: Dispatch<SetStateAction<WorldDocument>>
  world: WorldDocument
}) {
  const trimmedName = args.countryDraftName.trim()
  if (!trimmedName) {
    return
  }

  if (args.editingCountryId) {
    const country = args.world.countries[args.editingCountryId]

    if (country) {
      const nextGovernmentTypeId =
        args.countryDraftGovernmentTypeId === 'none'
          ? null
          : args.countryDraftGovernmentTypeId
      args.setWorld((current) =>
        upsertCountry(current, {
          ...country,
          name: trimmedName,
          secondName: args.countryDraftSecondName.trim(),
          iconKey: args.countryDraftIconKey,
          color: args.countryDraftColor,
          borderColor: args.countryDraftBorderColor,
          provinceDefaultColor: args.countryDraftProvinceDefaultColor,
          provinceBorderColor: args.countryDraftProvinceBorderColor,
          governmentTypeId: nextGovernmentTypeId,
          isCityState: args.countryDraftIsCityState,
          description: args.countryDraftDescription.trim(),
        }),
      )
    }
  } else {
    const newCountry = {
      ...createCountry(trimmedName, args.countryDraftColor),
      secondName: args.countryDraftSecondName.trim(),
      iconKey: args.countryDraftIconKey,
      borderColor: args.countryDraftBorderColor,
      provinceDefaultColor: args.countryDraftProvinceDefaultColor,
      provinceBorderColor: args.countryDraftProvinceBorderColor,
      governmentTypeId:
        args.countryDraftGovernmentTypeId === 'none'
          ? null
          : args.countryDraftGovernmentTypeId,
      isCityState: args.countryDraftIsCityState,
      description: args.countryDraftDescription.trim(),
    }

    args.setWorld((current) =>
      appendDraftAssignedLabels(
        upsertCountry(current, newCountry),
        args.countryAssignedLabelGroups,
        args.countryAssignedLabelDrafts,
        newCountry.id,
      ),
    )
    args.setActiveCountryId(newCountry.id)
  }

  args.closeCountryEditorWithPreviewReset()
}

export function deleteEditingGovernmentTypeState(args: {
  activeGovernmentTypeId: string | null
  closeGovernmentTypeEditorWithPreviewReset: () => void
  editingGovernmentTypeId: string | null
  setActiveGovernmentTypeId: Dispatch<SetStateAction<string | null>>
  setWorld: Dispatch<SetStateAction<WorldDocument>>
}) {
  if (!args.editingGovernmentTypeId) {
    return
  }

  args.setWorld((current) => removeGovernmentType(current, args.editingGovernmentTypeId!))
  if (args.activeGovernmentTypeId === args.editingGovernmentTypeId) {
    args.setActiveGovernmentTypeId(null)
  }
  args.closeGovernmentTypeEditorWithPreviewReset()
}

export function saveGovernmentTypeEditorState(args: {
  closeGovernmentTypeEditorWithPreviewReset: () => void
  editingGovernmentTypeId: string | null
  governmentTypeDraftColor: string
  governmentTypeDraftName: string
  governmentTypesLength: number
  setActiveGovernmentTypeId: Dispatch<SetStateAction<string | null>>
  setWorld: Dispatch<SetStateAction<WorldDocument>>
  world: WorldDocument
}) {
  const trimmedName = args.governmentTypeDraftName.trim()
  if (!trimmedName) {
    return
  }

  const nextGovernmentType =
    args.editingGovernmentTypeId && args.world.governmentTypes[args.editingGovernmentTypeId]
      ? {
          ...args.world.governmentTypes[args.editingGovernmentTypeId],
          name: trimmedName,
          color: args.governmentTypeDraftColor,
        }
      : createGovernmentType(
          trimmedName,
          args.governmentTypeDraftColor,
          args.governmentTypesLength,
        )

  args.setWorld((current) => upsertGovernmentType(current, nextGovernmentType))
  args.setActiveGovernmentTypeId(nextGovernmentType.id)
  args.closeGovernmentTypeEditorWithPreviewReset()
}

export function hasCityLevelUsage(
  world: Pick<WorldDocument, 'cities'>,
  cityLevelId: string | null,
) {
  if (!cityLevelId) {
    return false
  }

  return Object.values(world.cities).some((city) => city.levelId === cityLevelId)
}

export function deleteEditingCityLevelState(args: {
  editingCityLevelId: string | null
  handleCloseCityLevelEditor: () => void
  setActiveCityLevelId: Dispatch<SetStateAction<string | null>>
  setWorld: Dispatch<SetStateAction<WorldDocument>>
  world: WorldDocument
}) {
  if (hasCityLevelUsage(args.world, args.editingCityLevelId)) {
    return
  }
  if (!args.editingCityLevelId) {
    return
  }

  args.setWorld((current) => removeCityLevel(current, args.editingCityLevelId!))
  args.setActiveCityLevelId(null)
  args.handleCloseCityLevelEditor()
}

export function saveCityLevelEditorState(args: {
  cityLevelDraftDisplayInCountryInfo: boolean
  cityLevelDraftIconKey: string
  cityLevelDraftIconScalePercent: number
  cityLevelDraftName: string
  cityLevelDraftRank: number
  cityLevelDraftUniquePerCountry: boolean
  cityLevelsLength: number
  editingCityLevelId: string | null
  handleCloseCityLevelEditor: () => void
  iconSourceMap: Record<string, unknown>
  setActiveCityLevelId: Dispatch<SetStateAction<string | null>>
  setWorld: Dispatch<SetStateAction<WorldDocument>>
  world: WorldDocument
}) {
  const trimmedName = args.cityLevelDraftName.trim()
  if (!trimmedName || !args.iconSourceMap[args.cityLevelDraftIconKey]) {
    return
  }

  if (args.editingCityLevelId) {
    const existingLevel = args.world.cityLevels[args.editingCityLevelId]
    if (!existingLevel) {
      return
    }

    args.setWorld((current) =>
      upsertCityLevel(current, {
        ...existingLevel,
        name: trimmedName,
        rank: args.cityLevelDraftRank,
        iconKey: args.cityLevelDraftIconKey,
        iconScalePercent: args.cityLevelDraftIconScalePercent,
        uniquePerCountry: args.cityLevelDraftUniquePerCountry,
        displayInCountryInfo: args.cityLevelDraftDisplayInCountryInfo,
      }),
    )
    args.setActiveCityLevelId(args.editingCityLevelId)
  } else {
    const newLevel = createCityLevel(
      trimmedName,
      args.cityLevelDraftRank,
      args.cityLevelDraftIconKey,
      args.cityLevelDraftIconScalePercent,
      args.cityLevelsLength,
      args.cityLevelDraftUniquePerCountry,
      args.cityLevelDraftDisplayInCountryInfo,
    )
    args.setWorld((current) => upsertCityLevel(current, newLevel))
    args.setActiveCityLevelId(newLevel.id)
  }

  args.handleCloseCityLevelEditor()
}
