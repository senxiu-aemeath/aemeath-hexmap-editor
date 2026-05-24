import { useRef, useState } from 'react'

import type { ShortcutHintScope } from './shortcutHints'
import type { AltRadialMenuId } from './useAltRadialItems'

export function useAltShortcutState() {
  const [isAltShortcutOverlayOpen, setIsAltShortcutOverlayOpen] = useState(false)
  const [altShortcutScope, setAltShortcutScope] = useState<ShortcutHintScope>('sections')
  const [altPendingModeKey, setAltPendingModeKey] = useState<string>('1')
  const [altPendingSectionKey, setAltPendingSectionKey] = useState<string>('1')
  const [altRadialMenu, setAltRadialMenu] = useState<AltRadialMenuId>('root')
  const [isAltRadialSuppressed, setIsAltRadialSuppressed] = useState(false)
  const [isAltRadialMenuEnabled, setIsAltRadialMenuEnabled] = useState(true)
  const lastPointerViewportPositionRef = useRef({ x: 320, y: 240 })
  const [altRadialOriginPosition, setAltRadialOriginPosition] = useState({ x: 320, y: 240 })
  const suppressAltUntilReleaseRef = useRef(false)

  return {
    isAltShortcutOverlayOpen, setIsAltShortcutOverlayOpen,
    altShortcutScope, setAltShortcutScope,
    altPendingModeKey, setAltPendingModeKey,
    altPendingSectionKey, setAltPendingSectionKey,
    altRadialMenu, setAltRadialMenu,
    isAltRadialSuppressed, setIsAltRadialSuppressed,
    isAltRadialMenuEnabled, setIsAltRadialMenuEnabled,
    lastPointerViewportPositionRef,
    altRadialOriginPosition, setAltRadialOriginPosition,
    suppressAltUntilReleaseRef,
  }
}

export type AltShortcutState = ReturnType<typeof useAltShortcutState>
