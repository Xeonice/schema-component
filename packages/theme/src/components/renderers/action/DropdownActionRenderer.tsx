import { MoreVertical } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu'
import type { ActionRendererProps } from '../../../types'
import { cn } from '../../../lib/utils'

/**
 * Dropdown action renderer
 * Renders a dropdown menu of actions
 */
export function DropdownActionRenderer({
  action,
  onClick,
  disabled,
  className,
}: ActionRendererProps) {
  const items: any[] = []

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          disabled={disabled}
          className={className}
        >
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">{action.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {items.map((item, index) => (
          <DropdownMenuItem
            key={index}
            onClick={() => {
              if (item.onClick) {
                item.onClick()
              } else if (onClick) {
                onClick()
              }
            }}
            disabled={item.disabled}
          >
            {item.icon && <span className="mr-2">{item.icon}</span>}
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
