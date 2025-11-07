import { Plus, X } from 'lucide-react'
import { Input } from '../../../../components/ui/input'
import { Button } from '../../../../components/ui/button'
import type { DataRendererProps } from '../../../../types'
import { cn } from '../../../../lib/utils'

/**
 * Array renderer
 * Renders array values with add/remove functionality
 */
export function ArrayRenderer({
  value,
  onChange,
  mode = 'view',
  disabled,
  readOnly,
  className,
  error,
}: DataRendererProps) {
  const arrayValue = Array.isArray(value) ? value : []

  // View mode - display as list
  if (mode === 'view' || readOnly) {
    if (arrayValue.length === 0) {
      return <span className={cn('text-sm text-muted-foreground', className)}>-</span>
    }

    return (
      <ul className={cn('space-y-1 text-sm', className)}>
        {arrayValue.map((item, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span className="flex-1">{String(item)}</span>
          </li>
        ))}
      </ul>
    )
  }

  // Edit mode - display as list with add/remove buttons
  const handleAdd = () => {
    onChange?.([...arrayValue, ''])
  }

  const handleRemove = (index: number) => {
    const newArray = arrayValue.filter((_, i) => i !== index)
    onChange?.(newArray.length > 0 ? newArray : [])
  }

  const handleChange = (index: number, newValue: string) => {
    const newArray = [...arrayValue]
    newArray[index] = newValue
    onChange?.(newArray)
  }

  return (
    <div className={cn('space-y-2', className)}>
      {arrayValue.length === 0 ? (
        <div className="text-sm text-muted-foreground">No items</div>
      ) : (
        arrayValue.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              value={String(item)}
              onChange={(e) => handleChange(index, e.target.value)}
              disabled={disabled}
              className={cn(error && 'border-destructive')}
              placeholder={`Item ${index + 1}`}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleRemove(index)}
              disabled={disabled}
              className="h-9 w-9 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleAdd}
        disabled={disabled}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Item
      </Button>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}
