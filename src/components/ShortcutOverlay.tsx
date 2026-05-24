import type { ReactNode } from 'react'
import type { ShortcutHintSection } from '../features/shortcuts/shortcutHints'

interface ShortcutOverlayProps {
  visible: boolean
  sections: ShortcutHintSection[]
}

function renderShortcutItemContent(
  label: string,
  key: string,
  showKey: boolean | undefined,
  swatchColor: string | undefined,
) {
  return (
    <>
      {showKey !== false ? <kbd>{key}</kbd> : null}
      {swatchColor ? (
        <span
          className="shortcut-overlay__swatch"
          style={{ backgroundColor: swatchColor }}
          aria-hidden="true"
        />
      ) : null}
      <span>{label}</span>
    </>
  )
}

function renderShortcutItems(sectionTitle: string, items: ShortcutHintSection['items']): ReactNode {
  return items.map((item) => {
    const content = renderShortcutItemContent(
      item.label,
      item.key,
      item.showKey,
      item.swatchColor,
    )

    return item.onActivate ? (
      <button
        type="button"
        className={`shortcut-overlay__item${item.active ? ' is-active' : ''}`}
        key={`${sectionTitle}-${item.key}-${item.label}`}
        onClick={item.onActivate}
      >
        {content}
      </button>
    ) : (
      <div
        className={`shortcut-overlay__item${item.active ? ' is-active' : ''}`}
        key={`${sectionTitle}-${item.key}-${item.label}`}
      >
        {content}
      </div>
    )
  })
}

function renderShortcutTitle(section: ShortcutHintSection, compact = false) {
  return (
    <div className={`shortcut-overlay__title${compact ? ' shortcut-overlay__title--sub' : ''}`}>
      {section.prefixKey ? (
        <button
          type="button"
          className={`shortcut-overlay__prefix-key${section.active ? ' is-active' : ''}`}
          onClick={section.onActivate}
        >
          {section.prefixKey}
          {section.instantCycle ? '#' : section.zSupported ? '*' : section.entryZOnly ? '+' : ''}
        </button>
      ) : null}
      <span>{section.title.replace(/^[A-Z]\s/, '')}</span>
      {section.hint ? <span className="shortcut-overlay__hint">{section.hint}</span> : null}
      {section.valueBadge ? (
        <span className="shortcut-overlay__value-badge">{section.valueBadge}</span>
      ) : null}
    </div>
  )
}

export function ShortcutOverlay({ visible, sections }: ShortcutOverlayProps) {
  if (!visible) {
    return null
  }

  return (
    <div className="shortcut-overlay">
      {sections.map((section, index) => {
        const previous = sections[index - 1]
        const startsCompactGroup = section.compactGroup && !previous?.compactGroup

        if (section.compactGroup && previous?.compactGroup) {
          return null
        }

        if (startsCompactGroup) {
          const groupedSections: ShortcutHintSection[] = [section]
          let cursor = index + 1
          while (sections[cursor]?.compactGroup) {
            groupedSections.push(sections[cursor])
            cursor += 1
          }

          return (
            <div
              className={`shortcut-overlay__section${groupedSections.some((item) => item.active) ? ' is-active' : ''}`}
              key={`group-${section.title}`}
            >
              {groupedSections.map((groupedSection) => (
                <div className="shortcut-overlay__subsection" key={groupedSection.title}>
                  {renderShortcutTitle(groupedSection, true)}
                  <div className="shortcut-overlay__grid">
                    {renderShortcutItems(groupedSection.title, groupedSection.items)}
                  </div>
                </div>
              ))}
            </div>
          )
        }

        return (
          <div
            className={`shortcut-overlay__section${section.active ? ' is-active' : ''}`}
            key={section.title}
          >
            {renderShortcutTitle(section)}
            <div className="shortcut-overlay__grid">
              {renderShortcutItems(section.title, section.items)}
            </div>
          </div>
        )
      })}
    </div>
  )
}
