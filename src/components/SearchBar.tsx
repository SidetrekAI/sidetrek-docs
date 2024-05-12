import { useState, useEffect } from 'react'
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command'
import { Search } from 'lucide-react'

interface SearchBarProps {
  inputPlaceholder?: string
  items: any[]
}

export function SearchBar({ inputPlaceholder = 'Search the docs...', items }: SearchBarProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  return (
    <>
      <div
        className="w-[240px] h-8 flex items-center bg-slate-100 rounded-md px-2 py-1 text-sm text-slate-400 cursor-pointer"
        onClick={(e) => {
          e.preventDefault()
          setOpen((open) => !open)
        }}
      >
        <div className="grow flex items-center space-x-1">
          <Search size={20} />
          <span>{inputPlaceholder}</span>
        </div>
        <div>⌘K</div>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder={inputPlaceholder} />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            {items.map((item, i) => {
              return <CommandItem>{item}</CommandItem>
            })}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
