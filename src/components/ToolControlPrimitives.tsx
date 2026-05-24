import type { ReactNode } from 'react'

function joinClassNames(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

interface ControlCardProps {
  children: ReactNode
  className?: string
  variant?: 'framed' | 'frameless'
}

export function ControlCard({ children, className, variant = 'framed' }: ControlCardProps) {
  return (
    <div
      className={joinClassNames(
        'control-card',
        variant === 'frameless' ? 'control-card--frameless' : 'control-card--framed',
        className,
      )}
    >
      {children}
    </div>
  )
}

interface UnitHeaderProps {
  children: ReactNode
  className?: string
  size?: 'default' | 'large'
}

export function UnitHeader({ children, className }: UnitHeaderProps) {
  return <div className={joinClassNames('control-unit-header', className)}>{children}</div>
}

export function CardTitle({ children, className, size = 'default' }: UnitHeaderProps) {
  return (
    <div
      className={joinClassNames(
        'control-card-title',
        size === 'large' && 'control-card-title--large',
        className,
      )}
    >
      {children}
    </div>
  )
}

interface FieldKeyProps {
  children: ReactNode
  className?: string
}

export function FieldKey({ children, className }: FieldKeyProps) {
  return <div className={joinClassNames('control-field-key', className)}>{children}</div>
}

export function StackedFieldKey({ children, className }: FieldKeyProps) {
  return <div className={joinClassNames('control-field-key', 'control-field-key--stacked', className)}>{children}</div>
}

interface ControlUnitProps {
  children: ReactNode
  className?: string
}

export function ActionUnit({ children, className }: ControlUnitProps) {
  return <div className={joinClassNames('control-unit', 'control-unit--action', className)}>{children}</div>
}

interface FieldUnitProps extends ControlUnitProps {
  fieldKey?: ReactNode
  stacked?: boolean
}

export function FieldUnit({ children, className, fieldKey, stacked = false }: FieldUnitProps) {
  return (
    <div className={joinClassNames('control-unit', 'control-unit--field', className)}>
      {fieldKey
        ? stacked
          ? <StackedFieldKey>{fieldKey}</StackedFieldKey>
          : <FieldKey>{fieldKey}</FieldKey>
        : null}
      {children}
    </div>
  )
}

interface ControlRowProps {
  children: ReactNode
  className?: string
  columns?: 1 | 2 | 3 | 4
  layout?: 'buttons' | 'segmented' | 'field'
}

export function ControlRow({
  children,
  className,
  columns = 1,
  layout = 'buttons',
}: ControlRowProps) {
  return (
    <div
      className={joinClassNames(
        'control-row',
        `control-row--${layout}`,
        columns > 1 && `control-row--equal-${columns}`,
        className,
      )}
    >
      {children}
    </div>
  )
}

export function PlaceholderCell() {
  return <span className="control-placeholder-cell" aria-hidden="true" />
}
