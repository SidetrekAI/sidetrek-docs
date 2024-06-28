import { cn } from '@/lib/utils'

interface CodeProps {
  className?: string
  children: React.ReactNode
}

export default function Code({ children, className = '' }: CodeProps) {
  return <code className={cn('bg-slate-100 py-0.5 px-1 rounded-md', className)} style={{ fontSize: '0.85em' }}>{children}</code>
}
