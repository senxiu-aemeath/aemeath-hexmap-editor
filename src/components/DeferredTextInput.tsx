import { useEffect, useState } from 'react'

interface DeferredTextInputProps {
  value: string
  disabled?: boolean
  className?: string
  onCommit: (value: string) => void
}

export function DeferredTextInput({
  value,
  disabled = false,
  className,
  onCommit,
}: DeferredTextInputProps) {
  const [draft, setDraft] = useState(value)

  useEffect(() => {
    setDraft(value)
  }, [value])

  return (
    <input
      className={className ? `deferred-text-input ${className}` : 'deferred-text-input'}
      type="text"
      value={draft}
      disabled={disabled}
      onChange={(event) => {
        setDraft(event.target.value)
      }}
      onBlur={() => {
        onCommit(draft)
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault()
          event.currentTarget.blur()
        }
      }}
    />
  )
}
