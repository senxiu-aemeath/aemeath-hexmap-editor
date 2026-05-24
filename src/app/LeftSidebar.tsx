import type { ComponentProps, RefObject } from 'react'
import { BrandDock } from '../components/BrandDock'
import { SidebarToolSections } from '../components/SidebarToolSections'

type BrandDockProps = ComponentProps<typeof BrandDock>
type SidebarToolSectionsProps = ComponentProps<typeof SidebarToolSections>

interface LeftSidebarProps {
  // Sidebar ref + resize
  sidebarRef: RefObject<HTMLElement | null>
  onStartSidebarResize: () => void

  // BrandDock props (pass-through, with onLoadProject/onLoadConfig overridden below)
  brandDockProps: Omit<BrandDockProps, 'onLoadProject' | 'onLoadConfig'>

  // Hidden file input refs (owned by App, rendered here)
  projectFileInputRef: RefObject<HTMLInputElement | null>
  configFileInputRef: RefObject<HTMLInputElement | null>
  iconFileInputRef: RefObject<HTMLInputElement | null>

  // File input change handlers
  onLoadProjectFile: (event: React.ChangeEvent<HTMLInputElement>) => void
  onLoadConfigFile: (event: React.ChangeEvent<HTMLInputElement>) => void
  onUploadIconFile: (event: React.ChangeEvent<HTMLInputElement>) => void

  // SidebarToolSections props (pass-through)
  sidebarToolSectionsProps: SidebarToolSectionsProps
}

export function LeftSidebar({
  sidebarRef,
  onStartSidebarResize,
  brandDockProps,
  projectFileInputRef,
  configFileInputRef,
  iconFileInputRef,
  onLoadProjectFile,
  onLoadConfigFile,
  onUploadIconFile,
  sidebarToolSectionsProps,
}: LeftSidebarProps) {
  return (
    <aside className="sidebar" ref={sidebarRef}>
      <div
        className="sidebar-edge-resizer sidebar-edge-resizer--right"
        onMouseDown={onStartSidebarResize}
      />
      <BrandDock
        {...brandDockProps}
        onLoadProject={() => {
          projectFileInputRef.current?.click()
        }}
        onLoadConfig={() => {
          configFileInputRef.current?.click()
        }}
      />
      <SidebarToolSections {...sidebarToolSectionsProps} />

      <input
        ref={projectFileInputRef}
        className="visually-hidden-input"
        type="file"
        accept="application/json"
        onChange={(event) => {
          void onLoadProjectFile(event)
        }}
      />
      <input
        ref={configFileInputRef}
        className="visually-hidden-input"
        type="file"
        accept="application/json"
        onChange={(event) => {
          void onLoadConfigFile(event)
        }}
      />
      <input
        ref={iconFileInputRef}
        className="visually-hidden-input"
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        onChange={(event) => {
          void onUploadIconFile(event)
        }}
      />
    </aside>
  )
}
