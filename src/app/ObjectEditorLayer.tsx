import type { Dispatch, RefObject, SetStateAction } from 'react'
import type {
  City,
  CityLevel,
  Country,
  GovernmentType,
  Label,
  LabelGroup,
  Province,
  WorldDocument,
} from '../domain/world'
import { useUiMessages } from '../i18n'
import { AssignedLabelRemovalDialog } from '../components/AssignedLabelRemovalDialog'
import { CityEditorForm } from '../components/CityEditorForm'
import { CityLevelEditorForm } from '../components/CityLevelEditorForm'
import { CountryEditorForm } from '../components/CountryEditorForm'
import { EditorChrome } from '../components/EditorChrome'
import { GovernmentTypeEditorForm } from '../components/GovernmentTypeEditorForm'
import { LabelEditorForm } from '../components/LabelEditorForm'
import { LabelGroupEditorForm } from '../components/LabelGroupEditorForm'
import { ProvinceEditorForm } from '../components/ProvinceEditorForm'
import { UniqueLevelConflictDialog } from '../components/UniqueLevelConflictDialog'
import type { PendingAssignedLabelRemoval, UniqueLevelConflict } from '../features/labels/useLabelDialogController'
import type { LabelEditorOpenSnapshot } from '../features/labels/useLabelDraft'
import { describeLabelAnchor, describeLabelSource } from '../features/labels/labelHelpers'
import { sanitizeGridValue } from '../utils/appUtilities'
import type { ObjectEditorPresentation, ObjectEditorSidecarAnchor } from '../features/workspace/useLayoutState'

interface ObjectEditorLayerProps {
  // Presentation
  effectiveObjectEditorPresentation: ObjectEditorPresentation
  objectEditorSidecarAnchor: ObjectEditorSidecarAnchor

  // Active theme
  activeThemeId: string

  // World (needed for city/cityLevel/country lookups in dialogs)
  world: WorldDocument

  // ---- Label Group editor ----
  isLabelGroupEditorOpen: boolean
  editingLabelManagedGroup: LabelGroup | null
  labelGroupEditorOpenSnapshotRef: RefObject<LabelGroup | null>
  labelCountByGroupId: Record<string, number>
  describeAssignedLabelGroup: (group: LabelGroup) => string
  handleCloseLabelGroupEditor: () => void
  handleDeleteEditingLabelGroup: () => void

  // ---- Label editor ----
  isLabelEditorOpen: boolean
  editingLabel: Label | null
  editingLabelGroup: LabelGroup | null
  labelGroups: LabelGroup[]
  sortedCountries: Country[]
  sortedProvinces: Province[]
  sortedCities: City[]
  activeCityId: string | null
  activeCountryId: string | null
  activeProvinceId: string | null
  activeCanvasZoom: number
  editingAssignedLabelCountryFilter: string
  setEditingAssignedLabelCountryFilter: Dispatch<SetStateAction<string>>
  labelEditorOpenSnapshotRef: RefObject<LabelEditorOpenSnapshot | null>
  handleCloseLabelEditor: () => void
  handleDeleteEditingLabel: () => void

  // ---- Province editor ----
  isProvinceEditorOpen: boolean
  editingProvinceId: string | null
  editingProvince: Province | null
  provinceDraftName: string
  provinceDraftCountryId: string
  provinceDraftCapitalCityId: string
  provinceDraftColor: string
  provinceDraftDescription: string
  provinceCapitalCandidates: City[]
  provinceAssignedLabelGroups: LabelGroup[]
  provinceAssignedLabelDrafts: Record<string, boolean>
  closeProvinceEditorWithPreviewReset: () => void
  setProvinceDraftName: Dispatch<SetStateAction<string>>
  setProvinceDraftCountryId: Dispatch<SetStateAction<string>>
  setProvinceDraftCapitalCityId: Dispatch<SetStateAction<string>>
  setProvinceDraftColor: Dispatch<SetStateAction<string>>
  setProvincePreviewColor: (color: string) => void
  setProvinceDraftDescription: Dispatch<SetStateAction<string>>
  getCountryProvinceDefaultColor: (countryId: string | null) => string
  handleProvinceExistingAssignedLabelToggle: (group: LabelGroup, checked: boolean) => void
  handleProvinceDraftAssignedLabelToggle: (group: LabelGroup, checked: boolean) => void
  handleOpenProvinceCapitalCity: () => void
  handleDeleteEditingProvince: () => void
  handleSaveProvinceEditor: () => void

  // ---- Country editor ----
  isCountryEditorOpen: boolean
  editingCountryId: string | null
  countryDraftName: string
  countryDraftSecondName: string
  countryDraftIconKey: string | null
  countryDraftColor: string
  countryDraftBorderColor: string
  countryDraftProvinceDefaultColor: string
  countryDraftProvinceBorderColor: string
  countryDraftGovernmentTypeId: string
  countryDraftIsCityState: boolean
  countryDraftDescription: string
  governmentTypes: GovernmentType[]
  countryAssignedLabelGroups: LabelGroup[]
  countryAssignedLabelDrafts: Record<string, boolean>
  closeCountryEditorWithPreviewReset: () => void
  setCountryDraftName: Dispatch<SetStateAction<string>>
  setCountryDraftSecondName: Dispatch<SetStateAction<string>>
  setCountryDraftIconKey: Dispatch<SetStateAction<string | null>>
  autoComputeCountryDraftColorsFromFill: () => void
  setCountryDraftColor: Dispatch<SetStateAction<string>>
  setCountryPreviewColor: (color: string) => void
  setCountryDraftBorderColor: Dispatch<SetStateAction<string>>
  setCountryPreviewBorderColor: (color: string) => void
  setCountryDraftProvinceDefaultColor: Dispatch<SetStateAction<string>>
  setCountryDraftProvinceBorderColor: Dispatch<SetStateAction<string>>
  setCountryPreviewProvinceBorderColor: (color: string) => void
  setCountryDraftGovernmentTypeId: Dispatch<SetStateAction<string>>
  setCountryDraftIsCityState: Dispatch<SetStateAction<boolean>>
  setCountryDraftDescription: Dispatch<SetStateAction<string>>
  setActiveLabelId: Dispatch<SetStateAction<string | null>>
  openLabelEditor: (labelId: string) => void
  handleCountryAssignedLabelVisibilityToggle: (labelId: string) => void
  handleCountryExistingAssignedLabelToggle: (group: LabelGroup, checked: boolean) => void
  handleCountryDraftAssignedLabelToggle: (group: LabelGroup, checked: boolean) => void
  handleDeleteEditingCountry: () => void
  handleSaveCountryEditor: () => void

  // ---- Government Type editor ----
  isGovernmentTypeEditorOpen: boolean
  editingGovernmentTypeId: string | null
  governmentTypeDraftName: string
  governmentTypeDraftColor: string
  activeGovernmentTypeUsageCount: number
  closeGovernmentTypeEditorWithPreviewReset: () => void
  setGovernmentTypeDraftName: Dispatch<SetStateAction<string>>
  setGovernmentTypeDraftColor: Dispatch<SetStateAction<string>>
  setGovernmentTypePreviewColor: (color: string) => void
  handleDeleteEditingGovernmentType: () => void
  handleSaveGovernmentTypeEditor: () => void

  // ---- City editor ----
  isCityEditorOpen: boolean
  editingCityId: string | null
  pendingCityCellId: string | null
  cityDraftName: string
  cityDraftSecondName: string
  cityDraftLevelId: string
  cityDraftCountryId: string
  cityDraftDescription: string
  cityLevels: CityLevel[]
  cityAssignedLabelGroups: LabelGroup[]
  cityAssignedLabelDrafts: Record<string, boolean>
  handleCloseCityEditor: () => void
  setCityDraftName: Dispatch<SetStateAction<string>>
  setCityDraftSecondName: Dispatch<SetStateAction<string>>
  setCityDraftLevelId: Dispatch<SetStateAction<string>>
  setCityDraftCountryId: Dispatch<SetStateAction<string>>
  setCityDraftDescription: Dispatch<SetStateAction<string>>
  handleCityExistingAssignedLabelToggle: (group: LabelGroup, checked: boolean) => void
  handleCityDraftAssignedLabelToggle: (group: LabelGroup, checked: boolean) => void
  handleDeleteEditingCity: () => void
  handleSaveCityEditor: () => void

  // ---- City Level editor ----
  isCityLevelEditorOpen: boolean
  editingCityLevelId: string | null
  cityLevelDraftName: string
  cityLevelDraftRank: number
  cityLevelDraftIconKey: string
  defaultIconKey: string
  cityLevelDraftIconScalePercent: number
  cityLevelDraftUniquePerCountry: boolean
  cityLevelDraftDisplayInCountryInfo: boolean
  isEditingCityLevelInUse: boolean
  handleCloseCityLevelEditor: () => void
  setCityLevelDraftName: Dispatch<SetStateAction<string>>
  setCityLevelDraftRank: Dispatch<SetStateAction<number>>
  setCityLevelDraftIconKey: Dispatch<SetStateAction<string>>
  setCityLevelDraftIconScalePercent: Dispatch<SetStateAction<number>>
  setCityLevelDraftUniquePerCountry: Dispatch<SetStateAction<boolean>>
  setCityLevelDraftDisplayInCountryInfo: Dispatch<SetStateAction<boolean>>
  handleDeleteEditingCityLevel: () => void
  handleSaveCityLevel: () => void

  // ---- Dialogs ----
  pendingAssignedLabelRemoval: PendingAssignedLabelRemoval | null
  skipAssignedLabelRemovalConfirm: boolean
  handleCloseAssignedLabelRemovalDialog: () => void
  setSkipAssignedLabelRemovalConfirm: Dispatch<SetStateAction<boolean>>
  handleConfirmAssignedLabelRemoval: () => void
  uniqueLevelConflict: UniqueLevelConflict | null
  handleCloseUniqueLevelConflictDialog: () => void
  handleConfirmUniqueLevelConflict: () => void
}

export function ObjectEditorLayer({
  effectiveObjectEditorPresentation,
  objectEditorSidecarAnchor,
  activeThemeId,
  world,
  // Label group editor
  isLabelGroupEditorOpen,
  editingLabelManagedGroup,
  labelGroupEditorOpenSnapshotRef,
  labelCountByGroupId,
  describeAssignedLabelGroup,
  handleCloseLabelGroupEditor,
  handleDeleteEditingLabelGroup,
  // Label editor
  isLabelEditorOpen,
  editingLabel,
  editingLabelGroup,
  labelGroups,
  sortedCountries,
  sortedProvinces,
  sortedCities,
  activeCityId,
  activeCountryId,
  activeProvinceId,
  activeCanvasZoom,
  editingAssignedLabelCountryFilter,
  setEditingAssignedLabelCountryFilter,
  labelEditorOpenSnapshotRef,
  handleCloseLabelEditor,
  handleDeleteEditingLabel,
  // Province editor
  isProvinceEditorOpen,
  editingProvinceId,
  editingProvince,
  provinceDraftName,
  provinceDraftCountryId,
  provinceDraftCapitalCityId,
  provinceDraftColor,
  provinceDraftDescription,
  provinceCapitalCandidates,
  provinceAssignedLabelGroups,
  provinceAssignedLabelDrafts,
  closeProvinceEditorWithPreviewReset,
  setProvinceDraftName,
  setProvinceDraftCountryId,
  setProvinceDraftCapitalCityId,
  setProvinceDraftColor,
  setProvincePreviewColor,
  setProvinceDraftDescription,
  getCountryProvinceDefaultColor,
  handleProvinceExistingAssignedLabelToggle,
  handleProvinceDraftAssignedLabelToggle,
  handleOpenProvinceCapitalCity,
  handleDeleteEditingProvince,
  handleSaveProvinceEditor,
  // Country editor
  isCountryEditorOpen,
  editingCountryId,
  countryDraftName,
  countryDraftSecondName,
  countryDraftIconKey,
  countryDraftColor,
  countryDraftBorderColor,
  countryDraftProvinceDefaultColor,
  countryDraftProvinceBorderColor,
  countryDraftGovernmentTypeId,
  countryDraftIsCityState,
  countryDraftDescription,
  governmentTypes,
  countryAssignedLabelGroups,
  countryAssignedLabelDrafts,
  closeCountryEditorWithPreviewReset,
  setCountryDraftName,
  setCountryDraftSecondName,
  setCountryDraftIconKey,
  autoComputeCountryDraftColorsFromFill,
  setCountryDraftColor,
  setCountryPreviewColor,
  setCountryDraftBorderColor,
  setCountryPreviewBorderColor,
  setCountryDraftProvinceDefaultColor,
  setCountryDraftProvinceBorderColor,
  setCountryPreviewProvinceBorderColor,
  setCountryDraftGovernmentTypeId,
  setCountryDraftIsCityState,
  setCountryDraftDescription,
  setActiveLabelId,
  openLabelEditor,
  handleCountryAssignedLabelVisibilityToggle,
  handleCountryExistingAssignedLabelToggle,
  handleCountryDraftAssignedLabelToggle,
  handleDeleteEditingCountry,
  handleSaveCountryEditor,
  // Government type editor
  isGovernmentTypeEditorOpen,
  editingGovernmentTypeId,
  governmentTypeDraftName,
  governmentTypeDraftColor,
  activeGovernmentTypeUsageCount,
  closeGovernmentTypeEditorWithPreviewReset,
  setGovernmentTypeDraftName,
  setGovernmentTypeDraftColor,
  setGovernmentTypePreviewColor,
  handleDeleteEditingGovernmentType,
  handleSaveGovernmentTypeEditor,
  // City editor
  isCityEditorOpen,
  editingCityId,
  pendingCityCellId,
  cityDraftName,
  cityDraftSecondName,
  cityDraftLevelId,
  cityDraftCountryId,
  cityDraftDescription,
  cityLevels,
  cityAssignedLabelGroups,
  cityAssignedLabelDrafts,
  handleCloseCityEditor,
  setCityDraftName,
  setCityDraftSecondName,
  setCityDraftLevelId,
  setCityDraftCountryId,
  setCityDraftDescription,
  handleCityExistingAssignedLabelToggle,
  handleCityDraftAssignedLabelToggle,
  handleDeleteEditingCity,
  handleSaveCityEditor,
  // City level editor
  isCityLevelEditorOpen,
  editingCityLevelId,
  cityLevelDraftName,
  cityLevelDraftRank,
  cityLevelDraftIconKey,
  defaultIconKey,
  cityLevelDraftIconScalePercent,
  cityLevelDraftUniquePerCountry,
  cityLevelDraftDisplayInCountryInfo,
  isEditingCityLevelInUse,
  handleCloseCityLevelEditor,
  setCityLevelDraftName,
  setCityLevelDraftRank,
  setCityLevelDraftIconKey,
  setCityLevelDraftIconScalePercent,
  setCityLevelDraftUniquePerCountry,
  setCityLevelDraftDisplayInCountryInfo,
  handleDeleteEditingCityLevel,
  handleSaveCityLevel,
  // Dialogs
  pendingAssignedLabelRemoval,
  skipAssignedLabelRemovalConfirm,
  handleCloseAssignedLabelRemovalDialog,
  setSkipAssignedLabelRemovalConfirm,
  handleConfirmAssignedLabelRemoval,
  uniqueLevelConflict,
  handleCloseUniqueLevelConflictDialog,
  handleConfirmUniqueLevelConflict,
}: ObjectEditorLayerProps) {
  const ui = useUiMessages()

  return (
    <>
      {isLabelGroupEditorOpen && editingLabelManagedGroup && (
        <EditorChrome
          presentation={effectiveObjectEditorPresentation}
          sidecarAnchor={objectEditorSidecarAnchor}
          closeZoneLabel={ui.common.closeEditor}
          onClose={handleCloseLabelGroupEditor}
        >
          <LabelGroupEditorForm
            group={editingLabelManagedGroup}
            openingSnapshotRef={labelGroupEditorOpenSnapshotRef}
            labelCount={labelCountByGroupId[editingLabelManagedGroup.id] ?? 0}
            assignmentDescription={describeAssignedLabelGroup(editingLabelManagedGroup)}
            onClose={handleCloseLabelGroupEditor}
            onDelete={handleDeleteEditingLabelGroup}
          />
        </EditorChrome>
      )}

      {isLabelEditorOpen && editingLabel && (
        <EditorChrome
          presentation={effectiveObjectEditorPresentation}
          sidecarAnchor={objectEditorSidecarAnchor}
          closeZoneLabel={ui.common.closeEditor}
          onClose={handleCloseLabelEditor}
        >
          <LabelEditorForm
            label={editingLabel}
            labelGroup={editingLabelGroup}
            labelGroups={labelGroups}
            sortedCountries={sortedCountries}
            sortedProvinces={sortedProvinces}
            sortedCities={sortedCities}
            activeCityId={activeCityId}
            activeCountryId={activeCountryId}
            activeProvinceId={activeProvinceId}
            activeCanvasZoom={activeCanvasZoom}
            editingAssignedLabelCountryFilter={editingAssignedLabelCountryFilter}
            setEditingAssignedLabelCountryFilter={setEditingAssignedLabelCountryFilter}
            openingSnapshotRef={labelEditorOpenSnapshotRef}
            sourceDescription={describeLabelSource(editingLabel)}
            anchorDescription={describeLabelAnchor(editingLabel.anchor)}
            onClose={handleCloseLabelEditor}
            onDelete={handleDeleteEditingLabel}
          />
        </EditorChrome>
      )}

      {isProvinceEditorOpen && (
        <EditorChrome
          presentation={effectiveObjectEditorPresentation}
          sidecarAnchor={objectEditorSidecarAnchor}
          closeZoneLabel={ui.common.closeEditor}
          onClose={closeProvinceEditorWithPreviewReset}
        >
          <ProvinceEditorForm
            title={editingProvinceId ? ui.provinceEditor.editTitle : ui.provinceEditor.createTitle}
            editingProvinceId={editingProvinceId}
            editingProvince={editingProvince}
            name={provinceDraftName}
            countryId={provinceDraftCountryId}
            capitalCityId={provinceDraftCapitalCityId}
            color={provinceDraftColor}
            description={provinceDraftDescription}
            activeThemeId={activeThemeId}
            countries={sortedCountries}
            capitalCandidates={provinceCapitalCandidates}
            assignedLabelGroups={provinceAssignedLabelGroups}
            assignedLabelDrafts={provinceAssignedLabelDrafts}
            onClose={closeProvinceEditorWithPreviewReset}
            onNameChange={setProvinceDraftName}
            onCountryChange={(nextCountryId) => {
              setProvinceDraftCountryId(nextCountryId)
              setProvinceDraftCapitalCityId('none')
              if (!editingProvinceId) {
                setProvinceDraftColor(
                  getCountryProvinceDefaultColor(nextCountryId === 'unassigned' ? null : nextCountryId),
                )
              }
            }}
            onCapitalCityChange={setProvinceDraftCapitalCityId}
            onColorApply={(value) => {
              setProvinceDraftColor(value)
              setProvincePreviewColor(value)
            }}
            onDescriptionChange={setProvinceDraftDescription}
            onExistingAssignedLabelToggle={handleProvinceExistingAssignedLabelToggle}
            onDraftAssignedLabelToggle={handleProvinceDraftAssignedLabelToggle}
            onOpenCapitalCity={handleOpenProvinceCapitalCity}
            onDelete={handleDeleteEditingProvince}
            onSave={handleSaveProvinceEditor}
          />
        </EditorChrome>
      )}

      {isCountryEditorOpen && (
        <EditorChrome
          presentation={effectiveObjectEditorPresentation}
          sidecarAnchor={objectEditorSidecarAnchor}
          closeZoneLabel={ui.common.closeEditor}
          onClose={closeCountryEditorWithPreviewReset}
        >
          <CountryEditorForm
            title={editingCountryId ? ui.countryEditor.editTitle : ui.countryEditor.createTitle}
            editingCountryId={editingCountryId}
            name={countryDraftName}
            secondName={countryDraftSecondName}
            iconKey={countryDraftIconKey}
            color={countryDraftColor}
            borderColor={countryDraftBorderColor}
            provinceDefaultColor={countryDraftProvinceDefaultColor}
            provinceBorderColor={countryDraftProvinceBorderColor}
            governmentTypeId={countryDraftGovernmentTypeId}
            isCityState={countryDraftIsCityState}
            description={countryDraftDescription}
            activeThemeId={activeThemeId}
            governmentTypes={governmentTypes}
            assignedLabelGroups={countryAssignedLabelGroups}
            assignedLabelDrafts={countryAssignedLabelDrafts}
            onClose={closeCountryEditorWithPreviewReset}
            onNameChange={setCountryDraftName}
            onSecondNameChange={setCountryDraftSecondName}
            onIconChange={setCountryDraftIconKey}
            onAutoComputeColors={autoComputeCountryDraftColorsFromFill}
            onColorChange={(value) => {
              setCountryDraftColor(value)
              setCountryPreviewColor(value)
            }}
            onBorderColorChange={(value) => {
              setCountryDraftBorderColor(value)
              setCountryPreviewBorderColor(value)
            }}
            onProvinceDefaultColorChange={setCountryDraftProvinceDefaultColor}
            onProvinceBorderColorChange={(value) => {
              setCountryDraftProvinceBorderColor(value)
              setCountryPreviewProvinceBorderColor(value)
            }}
            onGovernmentTypeChange={setCountryDraftGovernmentTypeId}
            onIsCityStateChange={setCountryDraftIsCityState}
            onDescriptionChange={setCountryDraftDescription}
            onSelectAssignedLabel={setActiveLabelId}
            onOpenAssignedLabel={openLabelEditor}
            onToggleExistingAssignedLabelVisibility={handleCountryAssignedLabelVisibilityToggle}
            onToggleExistingAssignedLabel={handleCountryExistingAssignedLabelToggle}
            onToggleDraftAssignedLabel={handleCountryDraftAssignedLabelToggle}
            onDelete={handleDeleteEditingCountry}
            onSave={handleSaveCountryEditor}
          />
        </EditorChrome>
      )}

      {isGovernmentTypeEditorOpen && (
        <EditorChrome
          presentation={effectiveObjectEditorPresentation}
          sidecarAnchor={objectEditorSidecarAnchor}
          closeZoneLabel={ui.common.closeEditor}
          onClose={closeGovernmentTypeEditorWithPreviewReset}
        >
          <GovernmentTypeEditorForm
            title={
              editingGovernmentTypeId
                ? ui.governmentTypeEditor.editTitle
                : ui.governmentTypeEditor.createTitle
            }
            name={governmentTypeDraftName}
            color={governmentTypeDraftColor}
            activeThemeId={activeThemeId}
            canDelete={Boolean(editingGovernmentTypeId)}
            deleteDisabled={activeGovernmentTypeUsageCount > 0}
            onClose={closeGovernmentTypeEditorWithPreviewReset}
            onNameChange={setGovernmentTypeDraftName}
            onColorApply={(value) => {
              setGovernmentTypeDraftColor(value)
              setGovernmentTypePreviewColor(value)
            }}
            onDelete={handleDeleteEditingGovernmentType}
            onSave={handleSaveGovernmentTypeEditor}
          />
        </EditorChrome>
      )}

      {isCityEditorOpen && (pendingCityCellId !== null || (editingCityId && world.cities[editingCityId])) && (
        <EditorChrome
          presentation={effectiveObjectEditorPresentation}
          sidecarAnchor={objectEditorSidecarAnchor}
          closeZoneLabel={ui.common.closeEditor}
          onClose={handleCloseCityEditor}
        >
          <CityEditorForm
            title={editingCityId ? ui.cityEditor.editTitle : ui.cityEditor.createTitle}
            editingCityId={editingCityId}
            pendingCityCellId={pendingCityCellId}
            name={cityDraftName}
            secondName={cityDraftSecondName}
            levelId={cityDraftLevelId}
            countryId={cityDraftCountryId}
            description={cityDraftDescription}
            cityLevels={cityLevels}
            countries={sortedCountries}
            assignedLabelGroups={cityAssignedLabelGroups}
            assignedLabelDrafts={cityAssignedLabelDrafts}
            onClose={handleCloseCityEditor}
            onNameChange={setCityDraftName}
            onSecondNameChange={setCityDraftSecondName}
            onLevelChange={setCityDraftLevelId}
            onCountryChange={setCityDraftCountryId}
            onDescriptionChange={setCityDraftDescription}
            onExistingAssignedLabelToggle={handleCityExistingAssignedLabelToggle}
            onDraftAssignedLabelToggle={handleCityDraftAssignedLabelToggle}
            onDelete={handleDeleteEditingCity}
            onSave={handleSaveCityEditor}
          />
        </EditorChrome>
      )}

      {isCityLevelEditorOpen && (
        <EditorChrome
          presentation={effectiveObjectEditorPresentation}
          sidecarAnchor={objectEditorSidecarAnchor}
          closeZoneLabel={ui.common.closeEditor}
          onClose={handleCloseCityLevelEditor}
        >
          <CityLevelEditorForm
            title={
              editingCityLevelId
                ? ui.cityLevelEditor.editTitle
                : ui.cityLevelEditor.createTitle
            }
            name={cityLevelDraftName}
            rank={cityLevelDraftRank}
            iconKey={cityLevelDraftIconKey}
            defaultIconKey={defaultIconKey}
            iconScalePercent={cityLevelDraftIconScalePercent}
            uniquePerCountry={cityLevelDraftUniquePerCountry}
            displayInCountryInfo={cityLevelDraftDisplayInCountryInfo}
            canDelete={Boolean(editingCityLevelId)}
            deleteDisabled={isEditingCityLevelInUse}
            onClose={handleCloseCityLevelEditor}
            onNameChange={setCityLevelDraftName}
            onRankChange={(value) => {
              setCityLevelDraftRank(sanitizeGridValue(value, cityLevelDraftRank, 0, 999))
            }}
            onIconKeyChange={setCityLevelDraftIconKey}
            onIconScalePercentChange={(value) => {
              setCityLevelDraftIconScalePercent(
                sanitizeGridValue(value, cityLevelDraftIconScalePercent, 10, 400),
              )
            }}
            onUniquePerCountryChange={setCityLevelDraftUniquePerCountry}
            onDisplayInCountryInfoChange={setCityLevelDraftDisplayInCountryInfo}
            onDelete={handleDeleteEditingCityLevel}
            onSave={handleSaveCityLevel}
          />
        </EditorChrome>
      )}

      {pendingAssignedLabelRemoval && (
        <AssignedLabelRemovalDialog
          pending={pendingAssignedLabelRemoval}
          skipConfirm={skipAssignedLabelRemovalConfirm}
          onClose={handleCloseAssignedLabelRemovalDialog}
          onSkipConfirmChange={setSkipAssignedLabelRemovalConfirm}
          onConfirm={handleConfirmAssignedLabelRemoval}
        />
      )}

      {uniqueLevelConflict && (
        <UniqueLevelConflictDialog
          conflict={uniqueLevelConflict}
          levelName={world.cityLevels[uniqueLevelConflict.levelId]?.name ?? ''}
          countryName={
            uniqueLevelConflict.countryId
              ? world.countries[uniqueLevelConflict.countryId]?.name ?? 'Unknown'
              : 'Unassigned'
          }
          existingCityName={world.cities[uniqueLevelConflict.existingCityId]?.name ?? ''}
          onClose={handleCloseUniqueLevelConflictDialog}
          onConfirm={handleConfirmUniqueLevelConflict}
        />
      )}
    </>
  )
}
