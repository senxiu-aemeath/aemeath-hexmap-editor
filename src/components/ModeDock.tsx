import { useUiMessages } from '../i18n'
import { useEditorModeContext } from '../state/EditorModeContext'

interface ModeDockSubMode {
  id: string
  label: string
}

interface ModeDockProps {
  isOpen: boolean
  activeLabel: string
  politicalSubModes: ModeDockSubMode[]
  onOpen: () => void
  onClose: () => void
  onToggleOpen: () => void
  onSelectWorld: () => void
  onSelectSurface: () => void
  onSelectPoliticalSubMode: (subModeId: string) => void
  onSelectLabel: () => void
  onSelectMove: () => void
}

export function ModeDock({ isOpen,
  activeLabel,
  politicalSubModes,
  onOpen,
  onClose,
  onToggleOpen,
  onSelectWorld,
  onSelectSurface,
  onSelectPoliticalSubMode,
  onSelectLabel,
  onSelectMove,
}: ModeDockProps) {
  const ui = useUiMessages()
  const { editorMode, politicalSubMode } = useEditorModeContext()
  return (
    <div
      className={`mode-dock${isOpen ? ' is-open' : ''}`}
      onMouseEnter={onOpen}
      onMouseLeave={onClose}
    >
      <button className="mode-dock-active" type="button" onClick={onToggleOpen}>
        {activeLabel}
      </button>
      <div className="mode-dock-popover mode-list">
        <button
          className={`mode-button${editorMode === 'world' ? ' is-active' : ''}`}
          type="button"
          onClick={onSelectWorld}
        >
          {ui.editorMode.world}
        </button>
        <button
          className={`mode-button${editorMode === 'surface' ? ' is-active' : ''}`}
          type="button"
          onClick={onSelectSurface}
        >
          {ui.editorMode.surface}
        </button>
        <div className="mode-submode-list mode-submode-list--always">
          {politicalSubModes.map((subMode) => (
            <button
              key={subMode.id}
              className={`sub-mode-button${editorMode === 'political' && politicalSubMode === subMode.id ? ' is-active' : ''}`}
              type="button"
              onClick={() => {
                onSelectPoliticalSubMode(subMode.id)
              }}
            >
              {subMode.label}
            </button>
          ))}
        </div>
        <button
          className={`mode-button${editorMode === 'label' ? ' is-active' : ''}`}
          type="button"
          onClick={onSelectLabel}
        >
          {ui.editorMode.label}
        </button>
        <button
          className={`mode-button${editorMode === 'move' ? ' is-active' : ''}`}
          type="button"
          onClick={onSelectMove}
        >
          {ui.editorMode.move}
        </button>
      </div>
    </div>
  )
}
