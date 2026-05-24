import { createPortal } from 'react-dom'
import type { RefObject } from 'react'
import { useUiMessages } from '../i18n'
import { languageOptions, type UiLanguageId } from '../i18n_multilingual_latest'
import { APP_THEMES } from '../theme'
import { getFloatingPortalRoot } from './floatingPortalRoot'

type DoubleOpenMode = 'always' | 'matched' | 'never'

interface BrandDockProps {
  brandDockRef: RefObject<HTMLDivElement | null>
  brandDockPopoverRef: RefObject<HTMLDivElement | null>
  popoverRect: {
    top: number
    left: number
    width: number
  } | null
  isOpen: boolean
  isProjectOpen: boolean
  isConfigOpen: boolean
  isFontLookupOpen: boolean
  embedIconsInProjectFile: boolean
  activeThemeId: string
  fontFamilyOverride: string
  activeUiLanguage: UiLanguageId
  westernSidebarNameScale: number
  chineseSidebarNameScale: number
  previewCellsPerFrame: number
  uiIconInvert: boolean
  isAltRadialMenuEnabled: boolean
  doubleOpenRows: Array<{
    title: string
    value: DoubleOpenMode
    onChange: (value: DoubleOpenMode) => void
  }>
  onClearCloseTimer: () => void
  onOpen: () => void
  onCloseNow: () => void
  onScheduleClose: () => void
  onToggleProject: () => void
  onToggleConfig: () => void
  onOpenFontLookup: () => void
  onOpenIconManager: () => void
  onSaveProject: () => void
  onLoadProject: () => void
  onEmbedIconsInProjectFileChange: (value: boolean) => void
  onSaveConfig: () => void
  onLoadConfig: () => void
  onThemeChange: (themeId: string) => void
  onFontFamilyOverrideChange: (value: string) => void
  onUiLanguageChange: (value: UiLanguageId) => void
  onWesternSidebarNameScaleInput: (value: string) => void
  onChineseSidebarNameScaleInput: (value: string) => void
  onPreviewCellsPerFrameInput: (value: string) => void
  onUiIconInvertChange: (value: boolean) => void
  onAltRadialMenuEnabledChange: (value: boolean) => void
}

export function BrandDock({ brandDockRef,
  brandDockPopoverRef,
  popoverRect,
  isOpen,
  isProjectOpen,
  isConfigOpen,
  isFontLookupOpen,
  embedIconsInProjectFile,
  activeThemeId,
  fontFamilyOverride,
  activeUiLanguage,
  westernSidebarNameScale,
  chineseSidebarNameScale,
  previewCellsPerFrame,
  uiIconInvert,
  isAltRadialMenuEnabled,
  doubleOpenRows,
  onClearCloseTimer,
  onOpen,
  onCloseNow,
  onScheduleClose,
  onToggleProject,
  onToggleConfig,
  onOpenFontLookup,
  onOpenIconManager,
  onSaveProject,
  onLoadProject,
  onEmbedIconsInProjectFileChange,
  onSaveConfig,
  onLoadConfig,
  onThemeChange,
  onFontFamilyOverrideChange,
  onUiLanguageChange,
  onWesternSidebarNameScaleInput,
  onChineseSidebarNameScaleInput,
  onPreviewCellsPerFrameInput,
  onUiIconInvertChange,
  onAltRadialMenuEnabledChange,
}: BrandDockProps) {
  const ui = useUiMessages()
  const portalRoot = getFloatingPortalRoot()
  const popover =
    isOpen && portalRoot && popoverRect
      ? createPortal(
          <div
            ref={brandDockPopoverRef}
            className="brand-dock-popover brand-dock-popover--floating is-open"
            style={{
              top: `${popoverRect.top}px`,
              left: `${popoverRect.left}px`,
              width: `${popoverRect.width}px`,
            }}
            onMouseEnter={onOpen}
            onMouseLeave={(event) => {
              const relatedTarget = event.relatedTarget as Node | null
              if (
                brandDockRef.current?.contains(relatedTarget) ||
                brandDockPopoverRef.current?.contains(relatedTarget)
              ) {
                return
              }
              onScheduleClose()
            }}
          >
            <div className="brand-dock-menu-column">
              <button
                className={`mode-button brand-dock-menu-button${isProjectOpen ? ' is-active' : ''}`}
                type="button"
                aria-expanded={isProjectOpen}
                onClick={onToggleProject}
              >
                <span>{ui.common.projects}</span>
                <span className="brand-dock-menu-chevron">›</span>
              </button>
              <button
                className={`mode-button brand-dock-menu-button${isConfigOpen ? ' is-active' : ''}`}
                type="button"
                aria-expanded={isConfigOpen}
                onClick={onToggleConfig}
              >
                <span>{ui.common.configs}</span>
                <span className="brand-dock-menu-chevron">›</span>
              </button>
              <button
                className={`mode-button brand-dock-menu-button${isFontLookupOpen ? ' is-active' : ''}`}
                type="button"
                aria-expanded={isFontLookupOpen}
                onClick={onOpenFontLookup}
              >
                <span>{ui.common.fonts}</span>
              </button>
              <button
                className="mode-button brand-dock-menu-button"
                type="button"
                onClick={onOpenIconManager}
              >
                <span>{ui.icons.openManager}</span>
              </button>
            </div>
            {isProjectOpen ? (
              <div className="brand-dock-subpanel brand-dock-subpanel--popout">
                <button className="mode-button" type="button" onClick={onSaveProject}>
                  {ui.common.saveProject}
                </button>
                <button className="mode-button" type="button" onClick={onLoadProject}>
                  {ui.common.loadProject}
                </button>
                <label className="toggle-row compact-toggle-row">
                  <span>{ui.common.embedIconsInProjectFile}</span>
                  <input
                    type="checkbox"
                    checked={embedIconsInProjectFile}
                    onChange={(event) => {
                      onEmbedIconsInProjectFileChange(event.target.checked)
                    }}
                  />
                </label>
              </div>
            ) : null}
            {isConfigOpen ? (
              <div className="brand-dock-subpanel brand-dock-subpanel--popout">
                <button className="mode-button" type="button" onClick={onSaveConfig}>
                  {ui.common.saveConfig}
                </button>
                <button className="mode-button" type="button" onClick={onLoadConfig}>
                  {ui.common.loadConfig}
                </button>
                <div className="mode-list">
                  <label className="control-field compact-control-field">
                    <span>{ui.debug.theme}</span>
                    <select
                      value={activeThemeId}
                      onChange={(event) => {
                        onThemeChange(event.target.value)
                      }}
                    >
                      {APP_THEMES.map((theme) => (
                        <option key={theme.id} value={theme.id}>
                          {theme.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="control-field compact-control-field">
                    <span>{ui.common.fontOverride}</span>
                    <input
                      type="text"
                      value={fontFamilyOverride}
                      placeholder='"LXGW WenKai", "Maple Mono SC NF CN"'
                      onChange={(event) => {
                        onFontFamilyOverrideChange(event.target.value)
                      }}
                    />
                    <small>{ui.common.prependToThemeFont}</small>
                  </label>
                  <div className="control-field compact-control-field">
                    <span>{ui.common.uiLanguage}</span>
                    <div className="table-action-group table-action-group--segmented sidebar-segmented-group">
                      {languageOptions.map((option) => (
                        <button
                          key={option.id}
                          className={`toolbar-action-button${activeUiLanguage === option.id ? ' is-active' : ''}`}
                          type="button"
                          onClick={() => {
                            onUiLanguageChange(option.id)
                          }}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <label className="control-field compact-control-field">
                    <span>{ui.common.sidebarNameScaleWestern}</span>
                    <input
                      type="number"
                      min={0.6}
                      max={1.4}
                      step={0.02}
                      value={westernSidebarNameScale}
                      onChange={(event) => {
                        onWesternSidebarNameScaleInput(event.target.value)
                      }}
                    />
                  </label>
                  <label className="control-field compact-control-field">
                    <span>{ui.common.sidebarNameScaleChinese}</span>
                    <input
                      type="number"
                      min={0.6}
                      max={1.4}
                      step={0.02}
                      value={chineseSidebarNameScale}
                      onChange={(event) => {
                        onChineseSidebarNameScaleInput(event.target.value)
                      }}
                    />
                  </label>
                  <div className="double-open-group">
                    <div className="double-open-group__title">{ui.common.doubleClickOpen}</div>
                    {doubleOpenRows.map((row) => (
                      <div className="double-open-row" key={row.title}>
                        <span className="double-open-row__label">{row.title}</span>
                        <select
                          className="double-open-row__select"
                          value={row.value}
                          onChange={(event) => {
                            row.onChange(event.target.value as DoubleOpenMode)
                          }}
                        >
                          <option value="always">{ui.common.always}</option>
                          <option value="matched">{ui.common.matched}</option>
                          <option value="never">{ui.common.never}</option>
                        </select>
                      </div>
                    ))}
                  </div>
                  <label className="control-field compact-control-field">
                    <span>{ui.common.previewCellsPerFrame}</span>
                    <input
                      type="number"
                      min={1}
                      max={240}
                      step={1}
                      value={previewCellsPerFrame}
                      onChange={(event) => {
                        onPreviewCellsPerFrameInput(event.target.value)
                      }}
                    />
                  </label>
                  <label className="toggle-row compact-toggle-row">
                    <span>{ui.common.uiIconInvert}</span>
                    <input
                      type="checkbox"
                      checked={uiIconInvert}
                      onChange={(event) => {
                        onUiIconInvertChange(event.target.checked)
                      }}
                    />
                  </label>
                  <label className="toggle-row compact-toggle-row">
                    <span>{ui.common.altRadialMenu}</span>
                    <input
                      type="checkbox"
                      checked={isAltRadialMenuEnabled}
                      onChange={(event) => {
                        onAltRadialMenuEnabledChange(event.target.checked)
                      }}
                    />
                  </label>
                </div>
              </div>
            ) : null}
          </div>,
          portalRoot,
        )
      : null

  return (
    <>
      <div
        ref={brandDockRef}
        className={`brand-dock${isOpen ? ' is-open' : ''}`}
        onMouseEnter={() => {
          onClearCloseTimer()
          onOpen()
        }}
        onMouseLeave={(event) => {
          const relatedTarget = event.relatedTarget as Node | null
          if (
            brandDockPopoverRef.current?.contains(relatedTarget) ||
            brandDockRef.current?.contains(relatedTarget)
          ) {
            return
          }
          onScheduleClose()
        }}
      >
        <button
          className="brand-dock-active"
          type="button"
          onClick={() => {
            if (isOpen) {
              onCloseNow()
              return
            }
            onClearCloseTimer()
            onOpen()
          }}
        >
          <span className="brand-dock-owner">AEMEATH</span>
          <span className="brand-dock-title">AEMEATH</span>
          <span className="brand-dock-subtitle">
            <strong>A</strong>dorable <strong>E</strong>ditor for <strong>M</strong>anaging and <strong>E</strong>ngineering <strong>A</strong>rknights-inspired <strong>T</strong>iled <strong>H</strong>exmaps
          </span>
        </button>
      </div>
      {popover}
    </>
  )
}
