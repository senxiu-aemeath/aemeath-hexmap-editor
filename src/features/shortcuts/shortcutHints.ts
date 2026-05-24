import type { AppMessages } from '../../i18n'
import type {
  CityToolMode,
  CountryToolMode,
  PoliticalPaintMode,
  PoliticalSubMode,
  ProvinceToolMode,
} from '../../political/types'

type EditorMode = 'world' | 'surface' | 'political' | 'label' | 'move'
type TerrainDisplayMode = 'surface' | 'topography'
type TerrainBrushKind = 'empty' | 'unknown' | 'land' | 'water' | 'dark_water'
type TerrainPaintMode =
  | 'radius_0'
  | 'radius_1'
  | 'radius_2'
  | 'radius_3'
  | 'fill_type'
  | 'fill_height'

export type ShortcutHintScope =
  | 'mode'
  | 'sections'
  | 'world-submaps'
  | 'world-layers'
  | 'world-label-groups'
  | 'political-country-target'
  | 'political-province-target'
  | 'political-tool'
  | 'political-paint-mode'
  | 'terrain-display'
  | 'terrain-brush-type'
  | 'terrain-paint-mode'
  | 'terrain-elevation'

export interface ShortcutHint {
  key: string
  label: string
  active?: boolean
  showKey?: boolean
  swatchColor?: string
  onActivate?: () => void
}

export interface ShortcutHintSection {
  title: string
  active?: boolean
  items: ShortcutHint[]
  compactGroup?: boolean
  prefixKey?: string
  valueBadge?: string
  onActivate?: () => void
  hint?: string
  zSupported?: boolean
  instantCycle?: boolean
  entryZOnly?: boolean
}

interface ShortcutCountryLike {
  id: string
  name: string
  color: string
}

interface ShortcutProvinceLike {
  id: string
  name: string
  color: string
  countryId: string | null
}

interface ShortcutSubmapLike {
  id: string
  name: string
}

interface ShortcutLayerLike {
  id: string
  label: string
  visible: boolean
}

interface ShortcutLabelGroupLike {
  id: string
  name: string
  visible: boolean
}

export interface BuildShortcutHintSectionsParams {
  ui: AppMessages
  altShortcutScope: ShortcutHintScope
  altPendingModeKey: string
  altPendingSectionKey: string
  currentModeKey: string
  politicalSubMode: PoliticalSubMode
  countryToolMode: CountryToolMode
  provinceToolMode: ProvinceToolMode
  cityToolMode: CityToolMode
  activeCountryId: string | null
  activeProvinceId: string | null
  provinceChooserCountryId: string | null
  provinceChooserProvinces: ShortcutProvinceLike[]
  sortedCountries: ShortcutCountryLike[]
  sortedProvinces: ShortcutProvinceLike[]
  politicalPaintMode: PoliticalPaintMode
  terrainDisplayMode: TerrainDisplayMode
  terrainBrushKind: TerrainBrushKind
  terrainPaintMode: TerrainPaintMode
  terrainBrushElevation: number
  terrainSnowLineElevation: number
  submaps: ShortcutSubmapLike[]
  activeSubmapId: string | null
  isSubmapSelectionMode: boolean
  layersWithMeta: ShortcutLayerLike[]
  worldLayerShortcutTargetId: string | null
  labelGroups: ShortcutLabelGroupLike[]
  worldLabelGroupShortcutTargetId: string | null
  setAltShortcutScope: (scope: ShortcutHintScope | ((current: ShortcutHintScope) => ShortcutHintScope)) => void
  applyModeShortcutKey: (key: string) => void
  commitSectionShortcutKey: (key: string) => void
  cyclePoliticalTool: (delta: number) => void
  handleSetCityToolMode: (mode: CityToolMode) => void
  setCityToolMode: (mode: CityToolMode) => void
  setCountryToolMode: (mode: CountryToolMode) => void
  setProvinceToolMode: (mode: ProvinceToolMode) => void
  beginCreateCountry: () => void
  beginCreateProvince: () => void
  setActiveCountryId: (countryId: string | null) => void
  setActiveProvinceId: (provinceId: string | null) => void
  setPoliticalPaintMode: (mode: PoliticalPaintMode) => void
  setBrushRadius: (radius: number) => void
  cycleTerrainDisplayMode: (delta: number) => void
  setTerrainDisplayMode: (mode: TerrainDisplayMode) => void
  setTerrainBrushKind: (kind: TerrainBrushKind) => void
  setTerrainPaintMode: (mode: TerrainPaintMode) => void
  activateFullSubmapView: () => void
  beginCreateSubmapSelection: () => void
  setActiveSubmapId: (submapId: string | null) => void
  setIsSubmapSelectionMode: (value: boolean) => void
  toggleLayerVisibilityById: (layerId: string) => void
  toggleLabelGroupVisibilityById: (groupId: string) => void
  activateShortcutSection: (key: string) => void
}

export function buildShortcutHintSections({
  ui,
  altShortcutScope,
  altPendingModeKey,
  altPendingSectionKey,
  currentModeKey,
  politicalSubMode,
  countryToolMode,
  provinceToolMode,
  cityToolMode,
  activeCountryId,
  activeProvinceId,
  provinceChooserCountryId,
  provinceChooserProvinces,
  sortedCountries,
  sortedProvinces,
  politicalPaintMode,
  terrainDisplayMode,
  terrainBrushKind,
  terrainPaintMode,
  terrainBrushElevation,
  terrainSnowLineElevation,
  submaps,
  activeSubmapId,
  isSubmapSelectionMode,
  layersWithMeta,
  worldLayerShortcutTargetId,
  labelGroups,
  worldLabelGroupShortcutTargetId,
  setAltShortcutScope,
  applyModeShortcutKey,
  commitSectionShortcutKey,
  cyclePoliticalTool,
  handleSetCityToolMode,
  setCityToolMode,
  setCountryToolMode,
  setProvinceToolMode,
  beginCreateCountry,
  beginCreateProvince,
  setActiveCountryId,
  setActiveProvinceId,
  setPoliticalPaintMode,
  setBrushRadius,
  cycleTerrainDisplayMode,
  setTerrainDisplayMode,
  setTerrainBrushKind,
  setTerrainPaintMode,
  activateFullSubmapView,
  beginCreateSubmapSelection,
  setActiveSubmapId,
  setIsSubmapSelectionMode,
  toggleLayerVisibilityById,
  toggleLabelGroupVisibilityById,
  activateShortcutSection,
}: BuildShortcutHintSectionsParams): ShortcutHintSection[] {
  const displayedModeKey = altShortcutScope === 'mode' ? altPendingModeKey : currentModeKey
  const displayedEditorMode: EditorMode =
    displayedModeKey === '1'
      ? 'world'
      : displayedModeKey === '2'
        ? 'surface'
        : displayedModeKey === '6'
          ? 'label'
          : displayedModeKey === '7'
            ? 'move'
            : 'political'
  const displayedPoliticalSubMode: PoliticalSubMode =
    displayedModeKey === '4' ? 'province' : displayedModeKey === '5' ? 'city' : 'country'
  const displayedSectionIds =
    displayedEditorMode === 'world'
      ? ['1', '2', '3']
      : displayedEditorMode === 'surface'
        ? ['1', '2', '3', '4']
        : displayedEditorMode === 'political'
          ? displayedPoliticalSubMode === 'country'
            ? ['1', '2', '3']
            : displayedPoliticalSubMode === 'province'
              ? ['1', '2', '3', '4']
              : ['1']
          : ['1', '2']
  const displayedSectionKey = displayedSectionIds.includes(altPendingSectionKey)
    ? altPendingSectionKey
    : '1'

  const sections: ShortcutHintSection[] = [
    {
      title: `Q ${ui.common.mode}`,
      active: altShortcutScope === 'mode',
      prefixKey: 'Q',
      hint: ui.common.clickWheel,
      onActivate: () =>
        setAltShortcutScope((current) => (current === 'mode' ? 'sections' : 'mode')),
      items: [
        {
          key: '1',
          label: ui.common.map,
          active: displayedModeKey === '1',
          onActivate: () => {
            applyModeShortcutKey('1')
            setAltShortcutScope('sections')
          },
        },
        {
          key: '2',
          label: ui.common.terrain,
          active: displayedModeKey === '2',
          onActivate: () => {
            applyModeShortcutKey('2')
            setAltShortcutScope('sections')
          },
        },
        {
          key: '3',
          label: ui.common.country,
          active: displayedModeKey === '3',
          onActivate: () => {
            applyModeShortcutKey('3')
            setAltShortcutScope('sections')
          },
        },
        {
          key: '4',
          label: ui.common.province,
          active: displayedModeKey === '4',
          onActivate: () => {
            applyModeShortcutKey('4')
            setAltShortcutScope('sections')
          },
        },
        {
          key: '5',
          label: ui.common.city,
          active: displayedModeKey === '5',
          onActivate: () => {
            applyModeShortcutKey('5')
            setAltShortcutScope('sections')
          },
        },
        {
          key: '6',
          label: ui.common.labelItem,
          active: displayedModeKey === '6',
          onActivate: () => {
            applyModeShortcutKey('6')
            setAltShortcutScope('sections')
          },
        },
        {
          key: '7',
          label: ui.common.moveItem,
          active: displayedModeKey === '7',
          onActivate: () => {
            applyModeShortcutKey('7')
            setAltShortcutScope('sections')
          },
        },
      ],
    },
  ]

  if (displayedEditorMode === 'political') {
    const sectionItems: ShortcutHint[] =
      displayedPoliticalSubMode === 'country'
        ? [
            { key: '1', label: `${ui.common.tool}#` },
            { key: '2', label: `${ui.common.country}*` },
            { key: '3', label: `${ui.common.paintMode}*` },
          ]
        : displayedPoliticalSubMode === 'province'
          ? [
              { key: '1', label: `${ui.common.tool}#` },
              { key: '2', label: `${ui.common.country}*` },
              { key: '3', label: `${ui.common.province}*` },
              { key: '4', label: `${ui.common.paintMode}*` },
            ]
          : [{ key: '1', label: `${ui.common.tool}#` }]

    sections.push({
      title: ui.common.shortcutSections,
      active: altShortcutScope === 'sections',
      prefixKey: 'W',
      onActivate: () => setAltShortcutScope('sections'),
      hint: ui.common.clickWheel,
      items: sectionItems.map((item) => ({
        ...item,
        active: item.key === displayedSectionKey,
        onActivate: () => commitSectionShortcutKey(item.key),
      })),
    })

    sections.push({
      title: ui.common.tool,
      active: altShortcutScope === 'political-tool',
      prefixKey: 'R',
      onActivate: () => {
        cyclePoliticalTool(1)
        setAltShortcutScope('sections')
      },
      hint: ui.common.clickWheel,
      zSupported: true,
      instantCycle: true,
      items: [
        {
          key: '1',
          label: ui.politicalTool.view,
          active:
            displayedPoliticalSubMode === 'country'
              ? countryToolMode === 'view'
              : displayedPoliticalSubMode === 'province'
                ? provinceToolMode === 'view'
                : cityToolMode === 'view',
          onActivate: () => {
            if (politicalSubMode === 'city') setCityToolMode('view')
            else if (politicalSubMode === 'country') setCountryToolMode('view')
            else setProvinceToolMode('view')
          },
        },
        {
          key: '2',
          label:
            displayedPoliticalSubMode === 'city'
              ? ui.politicalTool.place_city
              : ui.politicalTool.paint,
          active:
            displayedPoliticalSubMode === 'country'
              ? countryToolMode === 'paint'
              : displayedPoliticalSubMode === 'province'
                ? provinceToolMode === 'paint'
                : cityToolMode === 'place_city',
          onActivate: () => {
            if (politicalSubMode === 'city') handleSetCityToolMode('place_city')
            else if (politicalSubMode === 'country') setCountryToolMode('paint')
            else setProvinceToolMode('paint')
          },
        },
        ...(displayedPoliticalSubMode === 'city'
          ? []
          : [
              {
                key: '3',
                label: ui.politicalTool.erase,
                active:
                  displayedPoliticalSubMode === 'country'
                    ? countryToolMode === 'erase'
                    : provinceToolMode === 'erase',
                onActivate: () => {
                  if (displayedPoliticalSubMode === 'country') setCountryToolMode('erase')
                  else setProvinceToolMode('erase')
                },
              } satisfies ShortcutHint,
            ]),
      ],
    })

    if (displayedPoliticalSubMode === 'country') {
      sections.push({
        title: ui.common.country,
        active: altShortcutScope === 'political-country-target',
        prefixKey: 'A',
        zSupported: true,
        onActivate: () =>
          setAltShortcutScope((current) =>
            current === 'political-country-target' ? 'sections' : 'political-country-target',
          ),
        hint: 'Click / Wheel',
        items: [
          {
            key: '1',
            label: `${ui.common.new} ${ui.common.country}`,
            onActivate: beginCreateCountry,
          },
          ...sortedCountries.map((country) => ({
            key: String(sortedCountries.findIndex((item) => item.id === country.id) + 2),
            label: country.name,
            active: activeCountryId === country.id,
            showKey: false,
            swatchColor: country.color,
            onActivate: () => setActiveCountryId(country.id),
          })),
        ],
      })
    } else if (displayedPoliticalSubMode === 'province') {
      sections.push({
        title: ui.common.country,
        active: altShortcutScope === 'political-country-target',
        prefixKey: 'A',
        zSupported: true,
        onActivate: () =>
          setAltShortcutScope((current) =>
            current === 'political-country-target' ? 'sections' : 'political-country-target',
          ),
        hint: 'Click / Wheel',
        items: [
          {
            key: '1',
            label: `${ui.common.new} ${ui.common.country}`,
            onActivate: beginCreateCountry,
          },
          ...sortedCountries.map((country) => ({
            key: String(sortedCountries.findIndex((item) => item.id === country.id) + 2),
            label: country.name,
            active: provinceChooserCountryId === country.id,
            showKey: false,
            swatchColor: country.color,
            onActivate: () => {
              setActiveCountryId(country.id)
              const nextProvince =
                sortedProvinces.find((province) => province.countryId === country.id) ?? null
              setActiveProvinceId(nextProvince?.id ?? null)
            },
          })),
        ],
      })
      sections.push({
        title: ui.common.province,
        active: altShortcutScope === 'political-province-target',
        prefixKey: 'D',
        zSupported: true,
        onActivate: () =>
          setAltShortcutScope((current) =>
            current === 'political-province-target' ? 'sections' : 'political-province-target',
          ),
        hint: 'Click / Wheel',
        items: [
          {
            key: '1',
            label: `${ui.common.new} ${ui.common.province}`,
            onActivate: beginCreateProvince,
          },
          ...provinceChooserProvinces.map((province) => ({
            key: String(provinceChooserProvinces.findIndex((item) => item.id === province.id) + 2),
            label: province.name,
            active: activeProvinceId === province.id,
            showKey: false,
            swatchColor: province.color,
            onActivate: () => setActiveProvinceId(province.id),
          })),
        ],
      })
    }

    if (displayedPoliticalSubMode !== 'city') {
      sections.push({
        title: ui.common.paintMode,
        active: altShortcutScope === 'political-paint-mode',
        prefixKey: 'S',
        onActivate: () =>
          setAltShortcutScope((current) =>
            current === 'political-paint-mode' ? 'sections' : 'political-paint-mode',
          ),
        zSupported: true,
        items: [
          {
            key: '1',
            label: 'R0',
            active: politicalPaintMode === 'radius_0',
            onActivate: () => {
              setPoliticalPaintMode('radius_0')
              setBrushRadius(0)
            },
          },
          {
            key: '2',
            label: 'R1',
            active: politicalPaintMode === 'radius_1',
            onActivate: () => {
              setPoliticalPaintMode('radius_1')
              setBrushRadius(1)
            },
          },
          {
            key: '3',
            label: 'R2',
            active: politicalPaintMode === 'radius_2',
            onActivate: () => {
              setPoliticalPaintMode('radius_2')
              setBrushRadius(2)
            },
          },
          {
            key: '4',
            label: 'R3',
            active: politicalPaintMode === 'radius_3',
            onActivate: () => {
              setPoliticalPaintMode('radius_3')
              setBrushRadius(3)
            },
          },
          {
            key: '5',
            label: ui.surface.fillType,
            active: politicalPaintMode === 'fill_type',
            onActivate: () => setPoliticalPaintMode('fill_type'),
          },
          {
            key: '6',
            label: ui.surface.fillHeight,
            active: politicalPaintMode === 'fill_height',
            onActivate: () => setPoliticalPaintMode('fill_height'),
          },
        ],
      })
    }
  }

  if (displayedEditorMode === 'surface') {
    sections.push({
      title: ui.common.shortcutSections,
      active: altShortcutScope === 'sections',
      prefixKey: 'W',
      onActivate: () => setAltShortcutScope('sections'),
      hint: ui.common.clickWheel,
      items: [
        {
          key: '1',
          label: `${ui.common.display}#`,
          active: displayedSectionKey === '1',
          onActivate: () => commitSectionShortcutKey('1'),
        },
        {
          key: '2',
          label: `${ui.common.brushType}*`,
          active: displayedSectionKey === '2',
          onActivate: () => commitSectionShortcutKey('2'),
        },
        {
          key: '3',
          label: `${ui.common.paintMode}*`,
          active: displayedSectionKey === '3',
          onActivate: () => commitSectionShortcutKey('3'),
        },
        {
          key: '4',
          label: ui.common.elevation,
          active: displayedSectionKey === '4',
          onActivate: () => commitSectionShortcutKey('4'),
        },
      ],
    })
    sections.push({
      title: ui.common.display,
      active: altShortcutScope === 'terrain-display',
      prefixKey: 'R',
      onActivate: () => {
        cycleTerrainDisplayMode(1)
        setAltShortcutScope('sections')
      },
      hint: ui.common.clickWheel,
      zSupported: true,
      instantCycle: true,
      items: [
        {
          key: '1',
          label: ui.common.surfaceItem,
          active: terrainDisplayMode === 'surface',
          onActivate: () => setTerrainDisplayMode('surface'),
        },
        {
          key: '2',
          label: ui.common.topography,
          active: terrainDisplayMode === 'topography',
          onActivate: () => setTerrainDisplayMode('topography'),
        },
      ],
    })
    sections.push({
      title: ui.common.brushType,
      active: altShortcutScope === 'terrain-brush-type',
      prefixKey: 'A',
      onActivate: () =>
        setAltShortcutScope((current) =>
          current === 'terrain-brush-type' ? 'sections' : 'terrain-brush-type',
        ),
      hint: ui.common.clickWheel,
      zSupported: true,
      items: [
        {
          key: '1',
          label: ui.surface.landBaseColor,
          active: terrainBrushKind === 'land',
          onActivate: () => setTerrainBrushKind('land'),
        },
        {
          key: '2',
          label: ui.surface.waterBaseSimpleColor,
          active: terrainBrushKind === 'water',
          onActivate: () => setTerrainBrushKind('water'),
        },
        {
          key: '3',
          label: ui.common.darkWater,
          active: terrainBrushKind === 'dark_water',
          onActivate: () => setTerrainBrushKind('dark_water'),
        },
        {
          key: '4',
          label: ui.surface.emptyColor,
          active: terrainBrushKind === 'empty',
          onActivate: () => setTerrainBrushKind('empty'),
        },
        {
          key: '5',
          label: ui.common.unknown,
          active: terrainBrushKind === 'unknown',
          onActivate: () => setTerrainBrushKind('unknown'),
        },
      ],
    })
    sections.push({
      title: ui.common.paintMode,
      active: altShortcutScope === 'terrain-paint-mode',
      prefixKey: 'S',
      onActivate: () =>
        setAltShortcutScope((current) =>
          current === 'terrain-paint-mode' ? 'sections' : 'terrain-paint-mode',
        ),
      hint: ui.common.clickWheel,
      zSupported: true,
      items: [
        {
          key: '1',
          label: 'R0',
          active: terrainPaintMode === 'radius_0',
          onActivate: () => setTerrainPaintMode('radius_0'),
        },
        {
          key: '2',
          label: 'R1',
          active: terrainPaintMode === 'radius_1',
          onActivate: () => setTerrainPaintMode('radius_1'),
        },
        {
          key: '3',
          label: 'R2',
          active: terrainPaintMode === 'radius_2',
          onActivate: () => setTerrainPaintMode('radius_2'),
        },
        {
          key: '4',
          label: 'R3',
          active: terrainPaintMode === 'radius_3',
          onActivate: () => setTerrainPaintMode('radius_3'),
        },
        {
          key: '5',
          label: ui.surface.fillType,
          active: terrainPaintMode === 'fill_type',
          onActivate: () => setTerrainPaintMode('fill_type'),
        },
        {
          key: '6',
          label: ui.surface.fillHeight,
          active: terrainPaintMode === 'fill_height',
          onActivate: () => setTerrainPaintMode('fill_height'),
        },
      ],
    })
    sections.push({
      title: ui.common.elevation,
      active: altShortcutScope === 'terrain-elevation',
      prefixKey: 'D',
      onActivate: () =>
        setAltShortcutScope((current) =>
          current === 'terrain-elevation' ? 'sections' : 'terrain-elevation',
        ),
      hint: ui.common.clickWheel,
      valueBadge:
        terrainBrushKind === 'empty' || terrainBrushKind === 'unknown'
          ? undefined
          : String(terrainBrushElevation),
      items:
        terrainBrushKind === 'empty' || terrainBrushKind === 'unknown'
          ? [{ key: '—', label: ui.common.disabled }]
          : terrainBrushKind === 'land'
            ? [
                { key: '1', label: '-1' },
                { key: '2', label: '+1' },
                { key: '3', label: ui.common.zero },
                { key: '4', label: `Snow[${terrainSnowLineElevation}]` },
              ]
            : [
                { key: '1', label: '-1' },
                { key: '2', label: '+1' },
                { key: '3', label: ui.common.zero },
              ],
    })
  }

  if (displayedEditorMode === 'world') {
    sections.push({
      title: ui.common.shortcutSections,
      active: altShortcutScope === 'sections',
      prefixKey: 'W',
      onActivate: () => setAltShortcutScope('sections'),
      hint: ui.common.clickWheel,
      items: [
        {
          key: '1',
          label: `${ui.common.submaps}*`,
          active: displayedSectionKey === '1',
          onActivate: () => commitSectionShortcutKey('1'),
        },
        {
          key: '2',
          label: `${ui.common.layersItem}+`,
          active: displayedSectionKey === '2',
          onActivate: () => commitSectionShortcutKey('2'),
        },
        {
          key: '3',
          label: `${ui.common.labelGroups}+`,
          active: displayedSectionKey === '3',
          onActivate: () => commitSectionShortcutKey('3'),
        },
      ],
    })
    sections.push({
      title: ui.common.submaps,
      active: altShortcutScope === 'world-submaps',
      prefixKey: 'R',
      zSupported: true,
      onActivate: () =>
        setAltShortcutScope((current) =>
          current === 'world-submaps' ? 'sections' : 'world-submaps',
        ),
      hint: ui.common.clickWheel,
      items: [
        {
          key: '1',
          label: ui.common.full,
          active: activeSubmapId === null && !isSubmapSelectionMode,
          onActivate: () => {
            activateFullSubmapView()
            setAltShortcutScope('sections')
          },
        },
        {
          key: '2',
          label: ui.common.addNew,
          active: isSubmapSelectionMode,
          onActivate: () => {
            beginCreateSubmapSelection()
            setAltShortcutScope('sections')
          },
        },
        ...submaps.map((submap, index) => ({
          key: String(index + 3),
          label: submap.name,
          active: activeSubmapId === submap.id,
          showKey: false,
          onActivate: () => {
            setActiveSubmapId(submap.id)
            setIsSubmapSelectionMode(false)
            setAltShortcutScope('sections')
          },
        })),
      ],
    })
    sections.push({
      title: ui.common.layersItem,
      active: altShortcutScope === 'world-layers',
      prefixKey: 'A',
      entryZOnly: true,
      onActivate: () =>
        setAltShortcutScope((current) =>
          current === 'world-layers' ? 'sections' : 'world-layers',
        ),
      hint: ui.common.clickWheel,
      items: layersWithMeta.map((layer, index) => ({
        key: String(index + 1),
        label: `${layer.label} - ${layer.visible ? ui.common.shownLabel : ui.common.hiddenLabel}`,
        active: worldLayerShortcutTargetId === layer.id,
        showKey: false,
        swatchColor: layer.visible ? '#7fb38b' : '#5e646d',
        onActivate: () => {
          toggleLayerVisibilityById(layer.id)
        },
      })),
    })
    sections.push({
      title: ui.common.labelGroups,
      active: altShortcutScope === 'world-label-groups',
      prefixKey: 'S',
      entryZOnly: true,
      onActivate: () =>
        setAltShortcutScope((current) =>
          current === 'world-label-groups' ? 'sections' : 'world-label-groups',
        ),
      hint: ui.common.clickWheel,
      items: labelGroups.map((group, index) => ({
        key: String(index + 1),
        label: `${group.name} - ${group.visible ? ui.common.shownLabel : ui.common.hiddenLabel}`,
        active: worldLabelGroupShortcutTargetId === group.id,
        showKey: false,
        swatchColor: group.visible ? '#7fb38b' : '#5e646d',
        onActivate: () => {
          toggleLabelGroupVisibilityById(group.id)
        },
      })),
    })
  }

  if (displayedEditorMode === 'label') {
    sections.push({
      title: ui.common.shortcutSections,
      active: altShortcutScope === 'sections',
      prefixKey: 'W',
      onActivate: () => setAltShortcutScope('sections'),
      hint: ui.common.clickWheel,
      items: [
        {
          key: '1',
          label: ui.common.labelGroups,
          active: displayedSectionKey === '1',
          onActivate: () => activateShortcutSection('1'),
        },
        {
          key: '2',
          label: ui.common.labelsItem,
          active: displayedSectionKey === '2',
          onActivate: () => activateShortcutSection('2'),
        },
      ],
    })
  }

  return sections
}
