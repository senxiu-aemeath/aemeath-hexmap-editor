import { useId } from 'react'
import { ColorPopoverPicker } from './ColorPopoverPicker'

interface ColorApplyFieldProps {
  value: string
  onApply: (value: string) => void
  pickerKey?: string
  themeId?: string
  disabled?: boolean
}
export function ColorApplyField({
  value,
  onApply,
  pickerKey,
  themeId,
  disabled = false,
}: ColorApplyFieldProps) {
  const pickerId = useId()

  return (
    <div className="color-apply-field">
      <ColorPopoverPicker
        value={value}
        onApply={onApply}
        pickerKey={pickerKey ?? `color-apply:${pickerId}`}
        themeId={themeId}
        disabled={disabled}
      />
    </div>
  )
}
