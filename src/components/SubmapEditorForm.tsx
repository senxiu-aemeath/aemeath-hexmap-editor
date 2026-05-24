import type { KeyboardEvent } from 'react'
import { useUiMessages } from '../i18n'
import { ColorApplyField } from './ColorApplyField'
import { EditorHeader } from './EditorHeader'

interface SubmapEditorFormProps {
  title: string
  name: string
  subtitle: string
  useWorldTitlePrefix: boolean
  useDefaultStyle: boolean
  titleFontSize: string
  subtitleFontSize: string
  bylineFontSize: string
  pageMarginTop: string
  titleGap: string
  byGap: string
  frameTop: string
  frameRight: string
  frameBottom: string
  frameLeft: string
  frameColor: string
  frameColorFallback: string
  onClose: () => void
  onNameChange: (value: string) => void
  onSubtitleChange: (value: string) => void
  onUseWorldTitlePrefixChange: (value: boolean) => void
  onUseDefaultStyleChange: (value: boolean) => void
  onTitleFontSizeChange: (value: string) => void
  onSubtitleFontSizeChange: (value: string) => void
  onBylineFontSizeChange: (value: string) => void
  onPageMarginTopChange: (value: string) => void
  onTitleGapChange: (value: string) => void
  onByGapChange: (value: string) => void
  onFrameTopChange: (value: string) => void
  onFrameRightChange: (value: string) => void
  onFrameBottomChange: (value: string) => void
  onFrameLeftChange: (value: string) => void
  onFrameColorApply: (value: string) => void
  onCommitDraft: () => void
  onCommitOnEnter: (event: KeyboardEvent<HTMLInputElement>) => void
  onDelete: () => void
  onSave: () => void
}

function SubmapTextField({
  label,
  value,
  disabled = false,
  onChange,
  onBlur,
  onKeyDown,
}: {
  label: string
  value: string
  disabled?: boolean
  onChange: (value: string) => void
  onBlur: () => void
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void
}) {
  return (
    <label className="control-field">
      <span>{label}</span>
      <input
        type="text"
        value={value}
        disabled={disabled}
        onChange={(event) => {
          onChange(event.target.value)
        }}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
      />
    </label>
  )
}

export function SubmapEditorForm({ title,
  name,
  subtitle,
  useWorldTitlePrefix,
  useDefaultStyle,
  titleFontSize,
  subtitleFontSize,
  bylineFontSize,
  pageMarginTop,
  titleGap,
  byGap,
  frameTop,
  frameRight,
  frameBottom,
  frameLeft,
  frameColor,
  frameColorFallback,
  onClose,
  onNameChange,
  onSubtitleChange,
  onUseWorldTitlePrefixChange,
  onUseDefaultStyleChange,
  onTitleFontSizeChange,
  onSubtitleFontSizeChange,
  onBylineFontSizeChange,
  onPageMarginTopChange,
  onTitleGapChange,
  onByGapChange,
  onFrameTopChange,
  onFrameRightChange,
  onFrameBottomChange,
  onFrameLeftChange,
  onFrameColorApply,
  onCommitDraft,
  onCommitOnEnter,
  onDelete,
  onSave,
}: SubmapEditorFormProps) {
  const ui = useUiMessages()
  return (
    <section className="editor-stack">
      <EditorHeader
        title={title}
        closeLabel={ui.common.close}
        onClose={onClose}
      />
      <label className="submap-editor-field">
        <span className="submap-editor-label">{ui.common.name}</span>
        <input
          value={name}
          onChange={(event) => {
            onNameChange(event.target.value)
          }}
          onBlur={onCommitDraft}
          onKeyDown={onCommitOnEnter}
        />
      </label>
      <label className="toggle-row">
        <span>{ui.world.useMapTitlePrefix}</span>
        <input
          type="checkbox"
          checked={useWorldTitlePrefix}
          onChange={(event) => {
            onUseWorldTitlePrefixChange(event.target.checked)
          }}
        />
      </label>
      <label className="toggle-row">
        <span>{ui.world.useDefaultStyle}</span>
        <input
          type="checkbox"
          checked={useDefaultStyle}
          onChange={(event) => {
            onUseDefaultStyleChange(event.target.checked)
          }}
        />
      </label>
      <label className="submap-editor-field">
        <span className="submap-editor-label">{ui.world.subtitle}</span>
        <input
          value={subtitle}
          onChange={(event) => {
            onSubtitleChange(event.target.value)
          }}
          onBlur={onCommitDraft}
          onKeyDown={onCommitOnEnter}
        />
      </label>
      <div className="mini-section-title">{ui.world.titleStyleSection}</div>
      <div className="world-grid-pair">
        <SubmapTextField
          label={ui.world.titleFontSize}
          value={titleFontSize}
          disabled={useDefaultStyle}
          onChange={onTitleFontSizeChange}
          onBlur={onCommitDraft}
          onKeyDown={onCommitOnEnter}
        />
        <SubmapTextField
          label={ui.world.subtitleFontSize}
          value={subtitleFontSize}
          disabled={useDefaultStyle}
          onChange={onSubtitleFontSizeChange}
          onBlur={onCommitDraft}
          onKeyDown={onCommitOnEnter}
        />
      </div>
      <div className="world-grid-pair">
        <SubmapTextField
          label={ui.world.bylineFontSize}
          value={bylineFontSize}
          disabled={useDefaultStyle}
          onChange={onBylineFontSizeChange}
          onBlur={onCommitDraft}
          onKeyDown={onCommitOnEnter}
        />
        <SubmapTextField
          label={ui.world.pageMarginTop}
          value={pageMarginTop}
          disabled={useDefaultStyle}
          onChange={onPageMarginTopChange}
          onBlur={onCommitDraft}
          onKeyDown={onCommitOnEnter}
        />
      </div>
      <div className="world-grid-pair">
        <SubmapTextField
          label={ui.world.titleSubtitleGap}
          value={titleGap}
          disabled={useDefaultStyle}
          onChange={onTitleGapChange}
          onBlur={onCommitDraft}
          onKeyDown={onCommitOnEnter}
        />
        <SubmapTextField
          label={ui.world.subtitleBylineGap}
          value={byGap}
          disabled={useDefaultStyle}
          onChange={onByGapChange}
          onBlur={onCommitDraft}
          onKeyDown={onCommitOnEnter}
        />
      </div>
      <div className="mini-section-title">{ui.world.frame}</div>
      <div className="world-grid-pair">
        <SubmapTextField
          label={ui.world.top}
          value={frameTop}
          disabled={useDefaultStyle}
          onChange={onFrameTopChange}
          onBlur={onCommitDraft}
          onKeyDown={onCommitOnEnter}
        />
        <SubmapTextField
          label={ui.world.right}
          value={frameRight}
          disabled={useDefaultStyle}
          onChange={onFrameRightChange}
          onBlur={onCommitDraft}
          onKeyDown={onCommitOnEnter}
        />
      </div>
      <div className="world-grid-pair">
        <SubmapTextField
          label={ui.world.bottom}
          value={frameBottom}
          disabled={useDefaultStyle}
          onChange={onFrameBottomChange}
          onBlur={onCommitDraft}
          onKeyDown={onCommitOnEnter}
        />
        <SubmapTextField
          label={ui.world.left}
          value={frameLeft}
          disabled={useDefaultStyle}
          onChange={onFrameLeftChange}
          onBlur={onCommitDraft}
          onKeyDown={onCommitOnEnter}
        />
      </div>
      <label className="control-field">
        <span>{ui.world.color}</span>
        <ColorApplyField
          value={frameColor || frameColorFallback}
          disabled={useDefaultStyle}
          onApply={onFrameColorApply}
        />
      </label>
      <div className="editor-actions submap-editor-actions">
        <button className="ghost-button" type="button" onClick={onClose}>
          {ui.common.cancel}
        </button>
        <button className="ghost-button danger-button" type="button" onClick={onDelete}>
          {ui.common.delete}
        </button>
        <button className="apply-button" type="button" onClick={onSave}>
          {ui.common.save}
        </button>
      </div>
    </section>
  )
}
