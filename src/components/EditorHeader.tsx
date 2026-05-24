interface EditorHeaderProps {
  title: string
  closeLabel: string
  onClose: () => void
}

export function EditorHeader({ title, closeLabel, onClose }: EditorHeaderProps) {
  return (
    <div className="country-table-header">
      <h3 className="table-title">{title}</h3>
      <button
        className="icon-button"
        type="button"
        aria-label={closeLabel}
        onClick={onClose}
      >
        ×
      </button>
    </div>
  )
}
