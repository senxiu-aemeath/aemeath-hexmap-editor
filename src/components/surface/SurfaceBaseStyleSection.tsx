import { useUiMessages } from '../../i18n'
import { ColorApplyField } from '../ColorApplyField'
import { SectionToggleHeader } from '../SectionToggleHeader'
import { CardTitle, ControlCard } from '../ToolControlPrimitives'

interface SurfaceColorField {
  label: string
  pickerKey: string
  value: string
  onApply: (value: string) => void
}

interface SurfaceEdgeField {
  label: string
  pickerKey: string
  color: string
  onApplyColor: (value: string) => void
  width: number
  onApplyWidth: (value: string) => void
}

interface SurfaceBaseStyleSectionProps {
  expanded: boolean
  onToggle: () => void
  colorFields: SurfaceColorField[]
  edgeFields: SurfaceEdgeField[]
  sliderMax: number
  inputMax: number
}

export function SurfaceBaseStyleSection({ expanded,
  onToggle,
  colorFields,
  edgeFields,
  sliderMax,
  inputMax,
}: SurfaceBaseStyleSectionProps) {
  const ui = useUiMessages()
  return (
    <section className="data-table-section section-gap">
      <SectionToggleHeader title={ui.surface.baseStyle} expanded={expanded} onToggle={onToggle} />
      {expanded ? (
        <div className="mode-tool-card-list">
          <CardTitle>{ui.surface.colors}</CardTitle>
          <ControlCard variant="frameless">
            <div className="surface-color-grid">
              {colorFields.map((field) => (
                <label key={field.pickerKey} className="control-field compact-control-field">
                  <span>{field.label}</span>
                  <ColorApplyField pickerKey={field.pickerKey} value={field.value} onApply={field.onApply} />
                </label>
              ))}
            </div>
          </ControlCard>
          <CardTitle>{ui.surface.edges}</CardTitle>
          <ControlCard variant="frameless">
            <div className="surface-color-grid">
              {edgeFields.map((field) => (
                <div key={field.pickerKey} className="control-field surface-edge-card">
                  <div className="surface-edge-header">
                    <span>{field.label}</span>
                    <ColorApplyField pickerKey={field.pickerKey} value={field.color} onApply={field.onApplyColor} />
                  </div>
                  <div className="surface-width-row">
                    <input
                      type="range"
                      min={0}
                      max={sliderMax}
                      step={0.1}
                      value={Math.min(field.width, sliderMax)}
                      onChange={(event) => {
                        field.onApplyWidth(event.target.value)
                      }}
                    />
                    <input
                      type="number"
                      min={0}
                      max={inputMax}
                      step={0.1}
                      value={field.width}
                      onChange={(event) => {
                        field.onApplyWidth(event.target.value)
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </ControlCard>
        </div>
      ) : null}
    </section>
  )
}
