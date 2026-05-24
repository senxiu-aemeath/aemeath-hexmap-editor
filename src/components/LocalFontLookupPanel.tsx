import { useUiMessages } from '../i18n'

interface LocalFontLookupEntry {
  family: string
  aliases: string[]
}

interface LocalFontLookupPanelProps {
  status: 'idle' | 'loading' | 'ready' | 'unsupported' | 'blocked' | 'error'
  entries: LocalFontLookupEntry[]
  totalEntryCount: number
  filter: string
  statusText: string
  copyError: string | null
  recentlyCopiedFontFamily: string | null
  onClose: () => void
  onQuery: () => void
  onRescan: () => void
  onFilterChange: (value: string) => void
  onCopy: (fontFamily: string) => void
}

export function LocalFontLookupPanel({ status,
  entries,
  totalEntryCount,
  filter,
  statusText,
  copyError,
  recentlyCopiedFontFamily,
  onClose,
  onQuery,
  onRescan,
  onFilterChange,
  onCopy,
}: LocalFontLookupPanelProps) {
  const ui = useUiMessages()
  return (
    <aside className="font-lookup-shell" aria-modal="false">
      <div className="icon-manager-shell__header">
        <div className="icon-manager-shell__heading">
          <strong>{ui.common.fontLookup}</strong>
          <span>{ui.common.localFontLookupHint}</span>
        </div>
        <button className="ghost-button" type="button" onClick={onClose}>
          {ui.common.close}
        </button>
      </div>
      <div className="icon-manager-shell__body font-lookup-shell__body">
        <div className="font-lookup-actions">
          <button
            className="mode-button font-lookup-query-button"
            type="button"
            disabled={status === 'loading'}
            onClick={onQuery}
          >
            {ui.common.queryLocalFonts}
          </button>
          <button
            className="mode-button font-lookup-query-button"
            type="button"
            disabled={status === 'loading'}
            onClick={onRescan}
          >
            {ui.common.rescanLocalFonts}
          </button>
        </div>
        <label className="control-field compact-control-field">
          <span>{ui.common.search}</span>
          <input
            type="text"
            value={filter}
            placeholder={ui.common.localFontLookupFilterPlaceholder}
            onChange={(event) => {
              onFilterChange(event.target.value)
            }}
          />
        </label>
        <small className="font-lookup-status">{statusText}</small>
        {copyError ? <small className="font-lookup-copy-error">{copyError}</small> : null}
        {entries.length > 0 ? (
          <div className="font-lookup-list" role="list">
            {entries.map((entry) => (
              <div className="font-lookup-item" key={entry.family} role="listitem">
                <div className="font-lookup-item__text">
                  <span className="font-lookup-item__name" title={entry.family}>
                    {entry.family}
                  </span>
                  {entry.aliases.length > 0 ? (
                    <small
                      className="font-lookup-item__aliases"
                      title={entry.aliases.join(' / ')}
                    >
                      {entry.aliases.slice(0, 2).join(' / ')}
                    </small>
                  ) : null}
                </div>
                <button
                  className="mode-button font-lookup-item__copy"
                  type="button"
                  onClick={() => {
                    onCopy(entry.family)
                  }}
                >
                  {recentlyCopiedFontFamily === entry.family ? ui.common.copied : ui.common.copy}
                </button>
              </div>
            ))}
          </div>
        ) : status === 'ready' ? (
          <small className="font-lookup-empty">
            {totalEntryCount === 0
              ? ui.common.localFontLookupNoFonts
              : ui.common.localFontLookupNoResults}
          </small>
        ) : null}
      </div>
    </aside>
  )
}
