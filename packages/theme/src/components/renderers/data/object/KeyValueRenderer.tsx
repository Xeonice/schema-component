import { Plus, X } from 'lucide-react'
import { Input } from '../../../../components/ui/input'
import type { DataRendererProps } from '../../../../types'
import { cn } from '../../../../lib/utils'
import { useState } from 'react'

/**
 * Key-value renderer
 * Renders object as editable key-value pairs
 */
export function KeyValueRenderer({
  value,
  onChange,
  mode = 'view',
  disabled,
  readOnly,
  className,
}: DataRendererProps) {
  const objValue = value && typeof value === 'object' && !Array.isArray(value) ? value : {}
  const entries = Object.entries(objValue)
  const [newKey, setNewKey] = useState('')
  const [newValue, setNewValue] = useState('')

  const handleAdd = () => {
    if (newKey.trim() && onChange) {
      onChange({ ...objValue, [newKey.trim()]: newValue })
      setNewKey('')
      setNewValue('')
    }
  }

  const handleRemove = (key: string) => {
    if (onChange) {
      const newObj = { ...objValue }
      delete newObj[key]
      onChange(newObj)
    }
  }

  const handleUpdate = (key: string, val: string) => {
    if (onChange) {
      onChange({ ...objValue, [key]: val })
    }
  }

  // View mode - display as table
  if (mode === 'view' || readOnly) {
    if (entries.length === 0) {
      return <span className={cn('text-sm text-muted-foreground', className)}>-</span>
    }

    return (
      <div className={cn('rounded-md border', className)}>
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Key</th>
              <th className="px-3 py-2 text-left font-medium">Value</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(([key, val]) => (
              <tr key={key} className="border-b last:border-0">
                <td className="px-3 py-2 font-mono text-xs">{key}</td>
                <td className="px-3 py-2">{String(val)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  // Edit mode - display as editable table
  return (
    <div className={cn('space-y-2', className)}>
      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Key</th>
              <th className="px-3 py-2 text-left font-medium">Value</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {entries.map(([key, val]) => (
              <tr key={key} className="border-b last:border-0">
                <td className="px-3 py-2 font-mono text-xs">{key}</td>
                <td className="px-3 py-2">
                  <Input
                    type="text"
                    value={String(val)}
                    onChange={(e) => handleUpdate(key, e.target.value)}
                    disabled={disabled}
                    className="h-8"
                  />
                </td>
                <td className="px-3 py-2">
                  <button
                    type="button"
                    onClick={() => handleRemove(key)}
                    disabled={disabled}
                    className="text-destructive hover:text-destructive/80"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex gap-2">
        <Input
          type="text"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          disabled={disabled}
          placeholder="Key"
          className="flex-1"
        />
        <Input
          type="text"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          disabled={disabled}
          placeholder="Value"
          className="flex-1"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={disabled || !newKey.trim()}
          className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>
    </div>
  )
}
