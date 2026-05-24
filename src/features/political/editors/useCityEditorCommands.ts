import type { Dispatch, SetStateAction } from 'react'

import {
  assignCountryToCell,
  createAssignedLabelForGroup,
  createCity,
  findAssignedLabelForObject,
  findExistingUniqueLevelCity,
  removeCity,
  upsertCity,
  upsertLabel,
  type LabelGroup,
  type WorldDocument,
} from '../../../domain/world'
import { closeCityEditor } from './cityEditorLifecycle'
import type { UniqueLevelConflict } from '../../labels/useLabelDialogController'

interface UseCityEditorCommandsArgs {
  state: {
    activeCityId: string | null
    cityAssignedLabelDrafts: Record<string, boolean>
    cityAssignedLabelGroups: LabelGroup[]
    cityDraftCountryId: string
    cityDraftDescription: string
    cityDraftLevelId: string
    cityDraftName: string
    cityDraftSecondName: string
    editingCityId: string | null
    pendingCityCellId: string | null
    world: WorldDocument
  }
  actions: {
    setActiveCityId: Dispatch<SetStateAction<string | null>>
    setCityAssignedLabelDrafts: Dispatch<SetStateAction<Record<string, boolean>>>
    setCityDraftCountryId: Dispatch<SetStateAction<string>>
    setCityDraftDescription: Dispatch<SetStateAction<string>>
    setCityDraftLevelId: Dispatch<SetStateAction<string>>
    setCityDraftName: Dispatch<SetStateAction<string>>
    setCityDraftSecondName: Dispatch<SetStateAction<string>>
    setEditingCityId: Dispatch<SetStateAction<string | null>>
    setIsCityEditorOpen: Dispatch<SetStateAction<boolean>>
    setPendingCityCellId: Dispatch<SetStateAction<string | null>>
    setUniqueLevelConflict: Dispatch<SetStateAction<UniqueLevelConflict | null>>
    setWorld: Dispatch<SetStateAction<WorldDocument>>
  }
}

export function useCityEditorCommands({
  state,
  actions,
}: UseCityEditorCommandsArgs) {
  const {
    activeCityId,
    cityAssignedLabelDrafts,
    cityAssignedLabelGroups,
    cityDraftCountryId,
    cityDraftDescription,
    cityDraftLevelId,
    cityDraftName,
    cityDraftSecondName,
    editingCityId,
    pendingCityCellId,
    world,
  } = state
  const {
    setActiveCityId,
    setCityAssignedLabelDrafts,
    setCityDraftCountryId,
    setCityDraftDescription,
    setCityDraftLevelId,
    setCityDraftName,
    setCityDraftSecondName,
    setEditingCityId,
    setIsCityEditorOpen,
    setPendingCityCellId,
    setUniqueLevelConflict,
    setWorld,
  } = actions

  const closeCityEditorState = () => {
    closeCityEditor(
      setIsCityEditorOpen,
      setEditingCityId,
      setPendingCityCellId,
      setCityDraftName,
      setCityDraftSecondName,
      setCityDraftCountryId,
      setCityDraftLevelId,
      setCityDraftDescription,
      setCityAssignedLabelDrafts,
    )
  }

  const finalizeCityCreationFromDraft = (
    baseWorld: WorldDocument,
    options?: {
      demoteExistingCityId?: string
      demoteToLevelId?: string
    },
  ) => {
    const trimmedName = cityDraftName.trim()
    if (!pendingCityCellId || !trimmedName || !baseWorld.cityLevels[cityDraftLevelId]) {
      return {
        nextWorld: baseWorld,
        createdCityId: null as string | null,
      }
    }

    const nextCountryId = cityDraftCountryId === 'unassigned' ? null : cityDraftCountryId
    let nextWorld = baseWorld

    if (options?.demoteExistingCityId && options.demoteToLevelId) {
      const existingCity = nextWorld.cities[options.demoteExistingCityId]
      if (existingCity) {
        nextWorld = upsertCity(nextWorld, {
          ...existingCity,
          levelId: options.demoteToLevelId,
        })
      }
    }

    const newCity = createCity(trimmedName, pendingCityCellId, nextCountryId, cityDraftLevelId)
    newCity.secondName = cityDraftSecondName.trim()
    newCity.description = cityDraftDescription.trim()

    nextWorld = upsertCity(nextWorld, newCity)
    nextWorld = assignCountryToCell(nextWorld, pendingCityCellId, nextCountryId)

    for (const group of cityAssignedLabelGroups) {
      if (!cityAssignedLabelDrafts[group.id]) {
        continue
      }
      if (findAssignedLabelForObject(nextWorld, group.id, newCity.id)) {
        continue
      }
      const nextLabel = createAssignedLabelForGroup(nextWorld, group.id, newCity.id)
      if (!nextLabel) {
        continue
      }
      nextWorld = upsertLabel(nextWorld, nextLabel)
    }

    return {
      nextWorld,
      createdCityId: newCity.id,
    }
  }

  const handleDeleteEditingCity = () => {
    if (!editingCityId) {
      return
    }

    setWorld((current) => removeCity(current, editingCityId))
    if (activeCityId === editingCityId) {
      setActiveCityId(null)
    }
    closeCityEditorState()
  }

  const handleSaveCityEditor = () => {
    const trimmedName = cityDraftName.trim()
    if (!trimmedName || !world.cityLevels[cityDraftLevelId]) {
      return
    }

    const nextCountryId = cityDraftCountryId === 'unassigned' ? null : cityDraftCountryId

    if (!editingCityId) {
      if (!pendingCityCellId) {
        return
      }
      const { nextWorld, createdCityId } = finalizeCityCreationFromDraft(world)
      setWorld(nextWorld)
      if (createdCityId) {
        setActiveCityId(createdCityId)
      }
      closeCityEditorState()
      return
    }

    const city = world.cities[editingCityId]
    if (!city) {
      return
    }

    if (cityDraftLevelId !== city.levelId) {
      const level = world.cityLevels[cityDraftLevelId]
      if (level?.uniquePerCountry) {
        const existingUniqueCity = findExistingUniqueLevelCity(
          world,
          nextCountryId,
          cityDraftLevelId,
          editingCityId,
        )
        if (existingUniqueCity) {
          setUniqueLevelConflict({
            levelId: cityDraftLevelId,
            countryId: nextCountryId,
            existingCityId: existingUniqueCity.id,
            actionType: 'change',
          })
          return
        }
      }
    }

    setWorld((current) => {
      const nextWorld = upsertCity(current, {
        ...city,
        name: trimmedName,
        secondName: cityDraftSecondName.trim(),
        levelId: cityDraftLevelId,
        countryId: nextCountryId,
        description: cityDraftDescription.trim(),
      })

      return assignCountryToCell(nextWorld, city.cellId, nextCountryId)
    })

    closeCityEditorState()
  }

  return {
    finalizeCityCreationFromDraft,
    handleDeleteEditingCity,
    handleSaveCityEditor,
  }
}
