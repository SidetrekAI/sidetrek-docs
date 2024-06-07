import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import { Check, CircleX, Info, Terminal, TriangleAlert } from 'lucide-react'

interface MyAlertProps {
  variant?: 'default' | 'info' | 'success' | 'warning' | 'error'
  title: string
  description: string
  className?: string
}

export default function MyAlert({ variant = 'default', title, description, className }: MyAlertProps) {
  const iconMap: any = {
    default: <Terminal className="w-4 h-4" />,
    info: <Info className="w-4 h-4 !text-sky-500" />,
    success: <Check className="w-4 h-4 !text-lime-500" />,
    warning: <TriangleAlert className="w-4 h-4 !text-amber-500" />,
    error: <CircleX className="w-4 h-4" />,
  }
  const iconElem = iconMap[variant]

  const variantMap: any = {
    default: 'default',
    info: 'info',
    success: 'success',
    warning: 'warning',
    error: 'destructive',
  }
  const alertVariant = variantMap[variant] as any

  return (
    <Alert variant={alertVariant} className={cn('mb-6', className)}>
      {iconElem}
      <AlertTitle className="mb-3">{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  )
}
