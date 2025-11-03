import { Image as ImageIcon, Upload, X } from 'lucide-react'
import { Input } from '../../../../components/ui/input'
import type { DataRendererProps } from '../../../../types'
import { getFieldOption } from '../../../../lib/fieldUtils'
import { cn } from '../../../../lib/utils'

/**
 * Image renderer
 * Renders image URL or file
 */
export function ImageRenderer({
  value,
  onChange,
  mode = 'view',
  disabled,
  readOnly,
  className,
  error,
  field,
}: DataRendererProps) {
  const imageUrl = typeof value === 'string' ? value : ''

  // View mode - display image
  if (mode === 'view' || readOnly) {
    if (!imageUrl) {
      return <span className={cn('text-sm text-muted-foreground', className)}>-</span>
    }

    const altText = getFieldOption(field, 'altText', 'Image')

    return (
      <div className={cn('inline-block', className)}>
        <img
          src={imageUrl}
          alt={altText}
          className="max-w-full h-auto max-h-48 rounded-md border"
          loading="lazy"
        />
      </div>
    )
  }

  // Edit mode - URL input
  return (
    <div className="space-y-2">
      {imageUrl && (
        <div className="relative inline-block">
          <img
            src={imageUrl}
            alt="Preview"
            className="max-w-full h-auto max-h-48 rounded-md border"
          />
          <button
            type="button"
            onClick={() => onChange?.('')}
            disabled={disabled}
            className="absolute top-2 right-2 rounded-full bg-destructive p-1 text-destructive-foreground hover:bg-destructive/90"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      <Input
        type="url"
        value={imageUrl}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        className={cn(error && 'border-destructive', className)}
        placeholder={getFieldOption(field, 'placeholder', 'https://example.com/image.jpg')}
      />
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}
