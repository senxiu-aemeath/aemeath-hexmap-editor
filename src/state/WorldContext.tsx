import { createContext, useContext } from 'react'
import type { WorldDocument } from '../domain/world'
import type { UserIconDefinition } from '../features/icons/iconRegistry'
import { createIconSourceMap, mergeIconRegistry } from '../features/icons/iconRegistry'

export interface WorldContextValue {
  world: WorldDocument
  setWorld: React.Dispatch<React.SetStateAction<WorldDocument>>
  userIcons: UserIconDefinition[]
  setUserIcons: React.Dispatch<React.SetStateAction<UserIconDefinition[]>>
  iconRegistryEntries: ReturnType<typeof mergeIconRegistry>
  iconSourceMap: ReturnType<typeof createIconSourceMap>
  defaultIconKey: string
}

export const WorldContext = createContext<WorldContextValue | null>(null)

export function useWorldContext() {
  const ctx = useContext(WorldContext)
  if (!ctx) throw new Error('useWorldContext must be used within WorldContext.Provider')
  return ctx
}
