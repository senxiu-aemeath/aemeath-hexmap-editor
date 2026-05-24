import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { getFloatingPortalRoot } from './floatingPortalRoot'

interface FloatingPortalProps {
  children: ReactNode
}

export function FloatingPortal({ children }: FloatingPortalProps) {
  const portalRoot = getFloatingPortalRoot()
  return portalRoot ? createPortal(children, portalRoot) : null
}
