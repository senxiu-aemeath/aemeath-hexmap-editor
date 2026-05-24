import type { AppMessages } from '../../i18n'

export type LayerId =
  | 'terrainFill'
  | 'terrainEdge'
  | 'countryFill'
  | 'countryBorder'
  | 'provinceFill'
  | 'provinceBorder'
  | 'cities'
  | 'labels'
  | 'overlay'

export interface LayerControl {
  id: LayerId
  label: string
  visible: boolean
  meta: string
}

export function migrateLoadedLayers(
  rawLayers: unknown,
  ui: AppMessages,
): LayerControl[] | null {
  if (!Array.isArray(rawLayers)) {
    return null
  }

  const defaults: LayerControl[] = [
    { id: 'terrainFill', label: ui.layers.terrainFill, visible: true, meta: '' },
    { id: 'terrainEdge', label: ui.layers.terrainEdge, visible: true, meta: '' },
    { id: 'countryFill', label: ui.layers.countryFill, visible: true, meta: '' },
    { id: 'countryBorder', label: ui.layers.countryBorder, visible: true, meta: '' },
    { id: 'provinceFill', label: ui.layers.provinceFill, visible: true, meta: '' },
    { id: 'provinceBorder', label: ui.layers.provinceBorder, visible: true, meta: '' },
    { id: 'cities', label: ui.layers.cities, visible: true, meta: '' },
    { id: 'labels', label: ui.layers.labels, visible: true, meta: '' },
    { id: 'overlay', label: ui.layers.overlay, visible: true, meta: '' },
  ]

  const nextById = new Map<LayerId, LayerControl>(defaults.map((layer) => [layer.id, layer]))

  for (const rawLayer of rawLayers) {
    if (!rawLayer || typeof rawLayer !== 'object') {
      continue
    }

    const candidate = rawLayer as {
      id?: string
      visible?: boolean
      fillVisible?: boolean
      borderVisible?: boolean
      label?: string
      meta?: string
    }

    const setLayer = (id: LayerId, visible: boolean) => {
      const fallback = nextById.get(id)
      if (!fallback) {
        return
      }
      nextById.set(id, {
        ...fallback,
        visible,
      })
    }

    switch (candidate.id) {
      case 'country':
        setLayer('countryFill', candidate.fillVisible ?? candidate.visible ?? true)
        setLayer('countryBorder', candidate.borderVisible ?? candidate.visible ?? true)
        break
      case 'province':
        setLayer('provinceFill', candidate.fillVisible ?? candidate.visible ?? true)
        setLayer('provinceBorder', candidate.borderVisible ?? candidate.visible ?? true)
        break
      case 'terrainFill':
      case 'terrainEdge':
      case 'countryFill':
      case 'countryBorder':
      case 'provinceFill':
      case 'provinceBorder':
      case 'cities':
      case 'labels':
      case 'overlay':
        setLayer(candidate.id, candidate.visible ?? true)
        break
      default:
        break
    }
  }

  return defaults.map((layer) => nextById.get(layer.id) ?? layer)
}

export function relabelLayers(currentLayers: LayerControl[], ui: AppMessages): LayerControl[] {
  const labelById: Record<LayerId, string> = {
    terrainFill: ui.layers.terrainFill,
    terrainEdge: ui.layers.terrainEdge,
    countryFill: ui.layers.countryFill,
    countryBorder: ui.layers.countryBorder,
    provinceFill: ui.layers.provinceFill,
    provinceBorder: ui.layers.provinceBorder,
    cities: ui.layers.cities,
    labels: ui.layers.labels,
    overlay: ui.layers.overlay,
  }

  return currentLayers.map((layer) => ({
    ...layer,
    label: labelById[layer.id],
  }))
}
