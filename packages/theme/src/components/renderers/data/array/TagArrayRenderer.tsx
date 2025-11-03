import { Plus, X } from 'lucide-react'
import { Input } from '../../../../components/ui/input'
import type { DataRendererProps } from '../../../../types'
import { cn } from '../../../../lib/utils'
import { useState } from 'react'

/**
 * Tag array renderer
 * Renders string arrays as tags
 */
export function TagArrayRenderer({
  value,
  onChange,
  mode = 'view',
  disabled,
  readOnly,
  className,
}: DataRendererProps) {
  const arrayValue = Array.isArray(value) ? value : []
  const [inputValue, setInputValue] = useState('')

  const handleAdd = () => {
    if (inputValue.trim() && onChange) {
      onChange([...arrayValue, inputValue.trim()])
      setInputValue('')
    }
  }

  const handleRemove = (index: number) => {
    if (onChange) {
      onChange(arrayValue.filter((_, i) => i !== index))
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAdd()
    }
  }

  // View mode - display as tags
  if (mode === 'view' || readOnly) {
    if (arrayValue.length === 0) {
      return <span className={cn('text-sm text-muted-foreground', className)}>-</span>
    }

    return (
      <div className={cn('flex flex-wrap gap-1', className)}>
        {arrayValue.map((item, index) => (
          <span
            key={index}
            className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
          >
            {String(item)}
          </span>
        ))}
      </div>
    )
  }

  // Edit mode - display as tag input
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex flex-wrap gap-1">
        {arrayValue.map((item, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
          >
            {String(item)}
            <button
              type="button"
              onClick={() => handleRemove(index)}
              disabled={disabled}
              className="hover:text-primary/80"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className="flex-1"
          placeholder="Add item..."
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={disabled || !inputValue.trim()}
          className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>
    </div>
  )
}
