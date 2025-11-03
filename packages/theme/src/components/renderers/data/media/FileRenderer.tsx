import { File, Download, X } from 'lucide-react'
import { Input } from '../../../../components/ui/input'
import type { DataRendererProps } from '../../../../types'
import { getFieldOption } from '../../../../lib/fieldUtils'
import { cn } from '../../../../lib/utils'

/**
 * File renderer
 * Renders file URL with download link
 */
export function FileRenderer({
  value,
  onChange,
  mode = 'view',
  disabled,
  readOnly,
  className,
  error,
  field,
}: DataRendererProps) {
  const fileUrl = typeof value === 'string' ? value : ''
  const fileName = fileUrl ? fileUrl.split('/').pop() || 'file' : ''

  // View mode - display download link
  if (mode === 'view' || readOnly) {
    if (!fileUrl) {
      return <span className={cn('text-sm text-muted-foreground', className)}>-</span>
    }

    return (
      <a
        href={fileUrl}
        download
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-accent',
          className
        )}
      >
        <File className="h-4 w-4" />
        <span className="flex-1 truncate max-w-xs">{fileName}</span>
        <Download className="h-4 w-4" />
      </a>
    )
  }

  // Edit mode - URL input
  return (
    <div className="space-y-2">
      {fileUrl && (
        <div className="flex items-center gap-2 rounded-md border px-3 py-2">
          <File className="h-4 w-4" />
          <span className="flex-1 truncate text-sm">{fileName}</span>
          <button
            type="button"
            onClick={() => onChange?.('')}
            disabled={disabled}
            className="text-destructive hover:text-destructive/80"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      <Input
        type="url"
        value={fileUrl}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        className={cn(error && 'border-destructive', className)}
        placeholder={getFieldOption(field, 'placeholder', 'https://example.com/file.pdf')}
      />
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}
