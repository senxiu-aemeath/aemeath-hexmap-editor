import type { CSSProperties } from 'react'

export interface AppTheme {
  id: string
  name: string
  uiIconInvert: boolean
  typography: {
    fontFamilyBase: string
    fontFamilyDisplay: string
    fontSizeBase: string
    lineHeightBase: string
    panelTitleSize: string
    sectionTitleSize: string
    tableTitleSize: string
    appTitleSize: string
  }
  colors: {
    appText: string
    panelTitle: string
    textPrimary: string
    textSecondary: string
    textMuted: string
    textInverse: string
    dangerText: string
    panelBorder: string
    panelBorderStrong: string
    surfaceBase: string
    surfaceMuted: string
    surfaceHover: string
    surfaceActive: string
    inputBg: string
    inputBorder: string
    focusRing: string
    workspaceBgStart: string
    workspaceBgEnd: string
    workspaceGlow: string
    sidebarBg: string
    modalBg: string
    modalShadow: string
    scrim: string
    pillBg: string
    pillBorder: string
    goldSoft: string
    goldStrong: string
    goldGlow: string
    actionFillStart: string
    actionFillEnd: string
    actionFillHoverStart: string
    actionFillHoverEnd: string
    canvasFrameBorder: string
    canvasFrameShadow: string
    canvasFrameBg: string
    anchor: string
    anchorSelected: string
    dangerSoft: string
  }
}

export const CLASSIC_THEME: AppTheme = {
  id: 'classic-collection-ha',
  name: 'Classic Default',
  uiIconInvert: false,
  typography: {
    fontFamilyBase: '"Segoe UI", "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif',
    fontFamilyDisplay: '"Segoe UI", "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif',
    fontSizeBase: '16px',
    lineHeightBase: '1.5',
    panelTitleSize: '0.88rem',
    sectionTitleSize: '1.12rem',
    tableTitleSize: '1.02rem',
    appTitleSize: '1.55rem',
  },
  colors: {
    appText: '#f4f0e2',
    panelTitle: '#d0c39d',
    textPrimary: '#fff6d9',
    textSecondary: '#e3dbc4',
    textMuted: '#c9c1ab',
    textInverse: '#f1e7c7',
    dangerText: '#ffcdbf',
    panelBorder: 'rgba(224, 212, 179, 0.12)',
    panelBorderStrong: 'rgba(224, 212, 179, 0.18)',
    surfaceBase: 'rgba(240, 229, 196, 0.06)',
    surfaceMuted: 'rgba(240, 229, 196, 0.04)',
    surfaceHover: 'rgba(240, 229, 196, 0.1)',
    surfaceActive: 'rgba(240, 211, 119, 0.16)',
    inputBg: 'rgba(9, 11, 11, 0.4)',
    inputBorder: 'rgba(224, 212, 179, 0.18)',
    focusRing: 'rgba(240, 211, 119, 0.28)',
    workspaceBgStart: '#1f2524',
    workspaceBgEnd: '#151918',
    workspaceGlow: 'rgba(248, 233, 193, 0.24)',
    sidebarBg: 'rgba(14, 17, 17, 0.72)',
    modalBg: '#161b1a',
    modalShadow: 'rgba(0, 0, 0, 0.35)',
    scrim: 'rgba(7, 8, 10, 0.56)',
    pillBg: 'rgba(233, 220, 174, 0.08)',
    pillBorder: 'rgba(231, 218, 182, 0.14)',
    goldSoft: 'rgba(240, 211, 119, 0.28)',
    goldStrong: 'rgba(240, 211, 119, 0.4)',
    goldGlow: 'rgba(240, 211, 119, 0.45)',
    actionFillStart: 'rgba(223, 185, 83, 0.22)',
    actionFillEnd: 'rgba(161, 120, 31, 0.18)',
    actionFillHoverStart: 'rgba(223, 185, 83, 0.28)',
    actionFillHoverEnd: 'rgba(161, 120, 31, 0.22)',
    canvasFrameBorder: 'rgba(221, 207, 167, 0.16)',
    canvasFrameShadow: 'rgba(0, 0, 0, 0.24)',
    canvasFrameBg: '#000000',
    anchor: '#d96b6b',
    anchorSelected: '#ff8e7a',
    dangerSoft: 'rgba(217, 76, 76, 0.1)',
  },
}

export const ALT_THEME: AppTheme = {
  id: 'atlas-workshop',
  name: 'Atlas Workshop',
  uiIconInvert: false,
  typography: {
    fontFamilyBase: '"Trebuchet MS", "Noto Sans SC", "PingFang SC", sans-serif',
    fontFamilyDisplay: '"Trebuchet MS", "Noto Sans SC", "PingFang SC", sans-serif',
    fontSizeBase: '16px',
    lineHeightBase: '1.5',
    panelTitleSize: '0.88rem',
    sectionTitleSize: '1.12rem',
    tableTitleSize: '1.02rem',
    appTitleSize: '1.55rem',
  },
  colors: {
    appText: '#f2eee6',
    panelTitle: '#c9c09f',
    textPrimary: '#fff7e8',
    textSecondary: '#dfd5c3',
    textMuted: '#c2b8a7',
    textInverse: '#f4ead7',
    dangerText: '#ffcdc2',
    panelBorder: 'rgba(210, 196, 167, 0.12)',
    panelBorderStrong: 'rgba(210, 196, 167, 0.18)',
    surfaceBase: 'rgba(237, 224, 196, 0.06)',
    surfaceMuted: 'rgba(237, 224, 196, 0.04)',
    surfaceHover: 'rgba(237, 224, 196, 0.1)',
    surfaceActive: 'rgba(204, 165, 92, 0.18)',
    inputBg: 'rgba(18, 20, 24, 0.45)',
    inputBorder: 'rgba(210, 196, 167, 0.18)',
    focusRing: 'rgba(204, 165, 92, 0.28)',
    workspaceBgStart: '#2b2f36',
    workspaceBgEnd: '#191c21',
    workspaceGlow: 'rgba(241, 210, 154, 0.2)',
    sidebarBg: 'rgba(19, 22, 27, 0.76)',
    modalBg: '#1d2127',
    modalShadow: 'rgba(0, 0, 0, 0.4)',
    scrim: 'rgba(8, 10, 14, 0.6)',
    pillBg: 'rgba(214, 189, 134, 0.1)',
    pillBorder: 'rgba(214, 189, 134, 0.14)',
    goldSoft: 'rgba(204, 165, 92, 0.28)',
    goldStrong: 'rgba(204, 165, 92, 0.4)',
    goldGlow: 'rgba(204, 165, 92, 0.45)',
    actionFillStart: 'rgba(201, 156, 74, 0.24)',
    actionFillEnd: 'rgba(132, 94, 37, 0.18)',
    actionFillHoverStart: 'rgba(201, 156, 74, 0.3)',
    actionFillHoverEnd: 'rgba(132, 94, 37, 0.24)',
    canvasFrameBorder: 'rgba(203, 191, 163, 0.16)',
    canvasFrameShadow: 'rgba(0, 0, 0, 0.28)',
    canvasFrameBg: '#090b0f',
    anchor: '#df6f69',
    anchorSelected: '#ff9b7f',
    dangerSoft: 'rgba(223, 111, 105, 0.12)',
  },
}

export const MONO_THEME: AppTheme = {
  id: 'jetbrains-mono-bureau',
  name: 'JetBrains Mono Bureau',
  uiIconInvert: true,
  typography: {
    fontFamilyBase:
      '"JetBrains Mono", "Cascadia Mono", "Fira Code", "Noto Sans Mono CJK SC", monospace',
    fontFamilyDisplay:
      '"JetBrains Mono", "Cascadia Mono", "Fira Code", "Noto Sans Mono CJK SC", monospace',
    fontSizeBase: '15px',
    lineHeightBase: '1.5',
    panelTitleSize: '0.84rem',
    sectionTitleSize: '1.06rem',
    tableTitleSize: '0.98rem',
    appTitleSize: '1.42rem',
  },
  colors: {
    appText: '#ece8dd',
    panelTitle: '#b9c4cf',
    textPrimary: '#f7f2e7',
    textSecondary: '#d8d1c1',
    textMuted: '#ada796',
    textInverse: '#f0ead8',
    dangerText: '#ffcbc4',
    panelBorder: 'rgba(198, 210, 224, 0.12)',
    panelBorderStrong: 'rgba(198, 210, 224, 0.18)',
    surfaceBase: 'rgba(205, 221, 235, 0.06)',
    surfaceMuted: 'rgba(205, 221, 235, 0.04)',
    surfaceHover: 'rgba(205, 221, 235, 0.1)',
    surfaceActive: 'rgba(133, 176, 210, 0.18)',
    inputBg: 'rgba(12, 15, 20, 0.46)',
    inputBorder: 'rgba(198, 210, 224, 0.18)',
    focusRing: 'rgba(133, 176, 210, 0.28)',
    workspaceBgStart: '#202832',
    workspaceBgEnd: '#14191f',
    workspaceGlow: 'rgba(158, 195, 230, 0.18)',
    sidebarBg: 'rgba(16, 20, 26, 0.78)',
    modalBg: '#171d24',
    modalShadow: 'rgba(0, 0, 0, 0.42)',
    scrim: 'rgba(8, 11, 16, 0.62)',
    pillBg: 'rgba(157, 188, 216, 0.1)',
    pillBorder: 'rgba(157, 188, 216, 0.16)',
    goldSoft: 'rgba(133, 176, 210, 0.3)',
    goldStrong: 'rgba(133, 176, 210, 0.42)',
    goldGlow: 'rgba(133, 176, 210, 0.48)',
    actionFillStart: 'rgba(112, 152, 194, 0.24)',
    actionFillEnd: 'rgba(64, 94, 132, 0.18)',
    actionFillHoverStart: 'rgba(112, 152, 194, 0.32)',
    actionFillHoverEnd: 'rgba(64, 94, 132, 0.24)',
    canvasFrameBorder: 'rgba(176, 198, 220, 0.16)',
    canvasFrameShadow: 'rgba(0, 0, 0, 0.3)',
    canvasFrameBg: '#05070a',
    anchor: '#de7878',
    anchorSelected: '#ffab8e',
    dangerSoft: 'rgba(222, 120, 120, 0.12)',
  },
}

export const AEMEATH_THEME_1: AppTheme = {
  id: 'aemeath-1',
  name: 'Aemeath 1',
  uiIconInvert: true,
  typography: {
    fontFamilyBase:
      '"JetBrains Mono", "Cascadia Mono", "Fira Code", "Noto Sans Mono CJK SC", monospace',
    fontFamilyDisplay:
      '"JetBrains Mono", "Cascadia Mono", "Fira Code", "Noto Sans Mono CJK SC", monospace',
    fontSizeBase: '15px',
    lineHeightBase: '1.5',
    panelTitleSize: '0.84rem',
    sectionTitleSize: '1.06rem',
    tableTitleSize: '0.98rem',
    appTitleSize: '1.42rem',
  },
  colors: {
    appText: '#e6eaf2',
    panelTitle: '#d3aac0',
    textPrimary: '#fff1f7',
    textSecondary: '#cfd6e3',
    textMuted: '#aab2c5',
    textInverse: '#f8edf3',
    dangerText: '#ffc6d2',
    panelBorder: 'rgba(46, 54, 72, 0.9)',
    panelBorderStrong: 'rgba(246, 163, 200, 0.22)',
    surfaceBase: 'rgba(246, 163, 200, 0.07)',
    surfaceMuted: 'rgba(127, 214, 255, 0.04)',
    surfaceHover: 'rgba(58, 143, 183, 0.18)',
    surfaceActive: 'rgba(246, 163, 200, 0.18)',
    inputBg: 'rgba(26, 31, 43, 0.86)',
    inputBorder: 'rgba(46, 54, 72, 0.95)',
    focusRing: 'rgba(246, 163, 200, 0.34)',
    workspaceBgStart: '#0f1117',
    workspaceBgEnd: '#090b10',
    workspaceGlow: 'rgba(246, 163, 200, 0.1)',
    sidebarBg: 'rgba(15, 17, 23, 0.9)',
    modalBg: '#1a1f2b',
    modalShadow: 'rgba(0, 0, 0, 0.46)',
    scrim: 'rgba(8, 10, 14, 0.68)',
    pillBg: 'rgba(246, 163, 200, 0.11)',
    pillBorder: 'rgba(246, 163, 200, 0.18)',
    goldSoft: 'rgba(246, 163, 200, 0.28)',
    goldStrong: 'rgba(246, 163, 200, 0.42)',
    goldGlow: 'rgba(246, 163, 200, 0.48)',
    actionFillStart: 'rgba(246, 163, 200, 0.26)',
    actionFillEnd: 'rgba(216, 111, 163, 0.2)',
    actionFillHoverStart: 'rgba(255, 182, 218, 0.34)',
    actionFillHoverEnd: 'rgba(216, 111, 163, 0.28)',
    canvasFrameBorder: 'rgba(46, 54, 72, 0.95)',
    canvasFrameShadow: 'rgba(0, 0, 0, 0.34)',
    canvasFrameBg: '#040508',
    anchor: '#f6a3c8',
    anchorSelected: '#ffd1e6',
    dangerSoft: 'rgba(216, 111, 163, 0.14)',
  },
}

export const AEMEATH_THEME_2: AppTheme = {
  ...AEMEATH_THEME_1,
  id: 'aemeath-2',
  name: 'Aemeath 2',
  colors: {
    ...AEMEATH_THEME_1.colors,
    appText: '#E6EAF2',
    panelTitle: '#7FD6FF',
    textPrimary: '#E6EAF2',
    textSecondary: '#AAB2C5',
    textMuted: '#6B7385',
    textInverse: '#FFF7FB',
    dangerText: '#FFD1E6',
    panelBorder: 'rgba(46, 54, 72, 0.96)',
    panelBorderStrong: 'rgba(127, 214, 255, 0.34)',
    surfaceBase: 'rgba(36, 43, 58, 0.86)',
    surfaceMuted: 'rgba(26, 31, 43, 0.92)',
    surfaceHover: 'rgba(58, 143, 183, 0.16)',
    surfaceActive: 'rgba(246, 163, 200, 0.14)',
    inputBg: 'rgba(26, 31, 43, 0.92)',
    inputBorder: 'rgba(44, 90, 115, 0.72)',
    focusRing: 'rgba(246, 163, 200, 0.3)',
    workspaceBgStart: '#0F1117',
    workspaceBgEnd: '#0A0C12',
    workspaceGlow: 'rgba(127, 214, 255, 0.08)',
    sidebarBg: 'rgba(15, 17, 23, 0.94)',
    modalBg: '#1A1F2B',
    modalShadow: 'rgba(0, 0, 0, 0.52)',
    scrim: 'rgba(7, 9, 13, 0.7)',
    pillBg: 'rgba(44, 90, 115, 0.22)',
    pillBorder: 'rgba(127, 214, 255, 0.24)',
    goldSoft: 'rgba(246, 163, 200, 0.2)',
    goldStrong: 'rgba(246, 163, 200, 0.34)',
    goldGlow: 'rgba(246, 163, 200, 0.42)',
    actionFillStart: 'rgba(246, 163, 200, 0.2)',
    actionFillEnd: 'rgba(216, 111, 163, 0.18)',
    actionFillHoverStart: 'rgba(255, 182, 218, 0.28)',
    actionFillHoverEnd: 'rgba(216, 111, 163, 0.24)',
    canvasFrameBorder: 'rgba(127, 214, 255, 0.22)',
    canvasFrameShadow: 'rgba(0, 0, 0, 0.38)',
    canvasFrameBg: '#05070D',
    anchor: '#F6A3C8',
    anchorSelected: '#FFD1E6',
  },
}

export const AEMEATH_THEME_3: AppTheme = {
  ...AEMEATH_THEME_1,
  id: 'aemeath-3',
  name: 'Aemeath 3',
  colors: {
    ...AEMEATH_THEME_1.colors,
    panelTitle: '#e4b1d0',
    textPrimary: '#fff6fa',
    textSecondary: '#ead3de',
    textMuted: '#c49dad',
    panelBorderStrong: 'rgba(255, 182, 218, 0.28)',
    surfaceBase: 'rgba(255, 182, 218, 0.09)',
    surfaceHover: 'rgba(255, 182, 218, 0.15)',
    surfaceActive: 'rgba(246, 163, 200, 0.24)',
    inputBorder: 'rgba(246, 163, 200, 0.34)',
    workspaceGlow: 'rgba(255, 182, 218, 0.16)',
    pillBg: 'rgba(255, 182, 218, 0.12)',
    pillBorder: 'rgba(255, 182, 218, 0.22)',
    goldSoft: 'rgba(255, 182, 218, 0.3)',
    goldStrong: 'rgba(255, 182, 218, 0.44)',
    goldGlow: 'rgba(255, 182, 218, 0.5)',
    actionFillStart: 'rgba(255, 182, 218, 0.28)',
    actionFillEnd: 'rgba(246, 163, 200, 0.22)',
    actionFillHoverStart: 'rgba(255, 209, 230, 0.34)',
    actionFillHoverEnd: 'rgba(246, 163, 200, 0.3)',
    anchor: '#ffb6da',
    anchorSelected: '#ffe1ef',
  },
}

export const DEFAULT_THEME = AEMEATH_THEME_1

export const APP_THEMES = [AEMEATH_THEME_1, AEMEATH_THEME_2, AEMEATH_THEME_3, MONO_THEME, CLASSIC_THEME, ALT_THEME] as const

export function getThemeById(themeId: string): AppTheme {
  return APP_THEMES.find((theme) => theme.id === themeId) ?? DEFAULT_THEME
}

export function getThemeCssVars(theme: AppTheme): CSSProperties {
  return {
    '--theme-font-family-base': theme.typography.fontFamilyBase,
    '--theme-font-family-display': theme.typography.fontFamilyDisplay,
    '--theme-font-size-base': theme.typography.fontSizeBase,
    '--theme-line-height-base': theme.typography.lineHeightBase,
    '--theme-panel-title-size': theme.typography.panelTitleSize,
    '--theme-section-title-size': theme.typography.sectionTitleSize,
    '--theme-table-title-size': theme.typography.tableTitleSize,
    '--theme-app-title-size': theme.typography.appTitleSize,
    '--theme-app-text': theme.colors.appText,
    '--theme-panel-title': theme.colors.panelTitle,
    '--theme-text-primary': theme.colors.textPrimary,
    '--theme-text-secondary': theme.colors.textSecondary,
    '--theme-text-muted': theme.colors.textMuted,
    '--theme-text-inverse': theme.colors.textInverse,
    '--theme-danger-text': theme.colors.dangerText,
    '--theme-panel-border': theme.colors.panelBorder,
    '--theme-panel-border-strong': theme.colors.panelBorderStrong,
    '--theme-surface-base': theme.colors.surfaceBase,
    '--theme-surface-muted': theme.colors.surfaceMuted,
    '--theme-surface-hover': theme.colors.surfaceHover,
    '--theme-surface-active': theme.colors.surfaceActive,
    '--theme-input-bg': theme.colors.inputBg,
    '--theme-input-border': theme.colors.inputBorder,
    '--theme-focus-ring': theme.colors.focusRing,
    '--theme-workspace-bg-start': theme.colors.workspaceBgStart,
    '--theme-workspace-bg-end': theme.colors.workspaceBgEnd,
    '--theme-workspace-glow': theme.colors.workspaceGlow,
    '--theme-sidebar-bg': theme.colors.sidebarBg,
    '--theme-modal-bg': theme.colors.modalBg,
    '--theme-modal-shadow': theme.colors.modalShadow,
    '--theme-scrim': theme.colors.scrim,
    '--theme-pill-bg': theme.colors.pillBg,
    '--theme-pill-border': theme.colors.pillBorder,
    '--theme-gold-soft': theme.colors.goldSoft,
    '--theme-gold-strong': theme.colors.goldStrong,
    '--theme-gold-glow': theme.colors.goldGlow,
    '--theme-action-fill-start': theme.colors.actionFillStart,
    '--theme-action-fill-end': theme.colors.actionFillEnd,
    '--theme-action-fill-hover-start': theme.colors.actionFillHoverStart,
    '--theme-action-fill-hover-end': theme.colors.actionFillHoverEnd,
    '--theme-canvas-frame-border': theme.colors.canvasFrameBorder,
    '--theme-canvas-frame-shadow': theme.colors.canvasFrameShadow,
    '--theme-canvas-frame-bg': theme.colors.canvasFrameBg,
    '--theme-anchor': theme.colors.anchor,
    '--theme-anchor-selected': theme.colors.anchorSelected,
    '--theme-danger-soft': theme.colors.dangerSoft,
  } as CSSProperties
}
