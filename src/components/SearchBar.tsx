import { useState, useEffect, useCallback } from 'react'
import { Search } from 'lucide-react'
import { useForm } from 'react-hook-form'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import debounce from 'lodash.debounce'
import { navigate } from 'astro:transitions/client'

interface SearchBarProps {
  inputPlaceholder?: string
}

export function SearchBar({ inputPlaceholder = 'Search the docs...' }: SearchBarProps) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<any[]>([])
  console.log('items', items)

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

  interface SearchFormData {
    search: string
  }

  const form = useForm<SearchFormData>({
    defaultValues: {
      search: '',
    },
  })

  const onSubmit = useCallback(
    debounce(async (formData: SearchFormData) => {
      const res = await fetch(`/api/search`, {
        method: 'POST',
        body: JSON.stringify({ searchQuery: formData.search }),
      })

      const data = await res.json()
      setItems(data)
    }, 300),
    []
  )

  // Programmatically trigger form submit
  const submitForm = async () => {
    // Trigger validations before submitting
    const isValid = await form.trigger()
    if (isValid) {
      form.handleSubmit(onSubmit)()
    }
  }

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

      <CommandDialog open={open} onOpenChange={setOpen} shouldFilter={false}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="search"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormControl>
                    <CommandList className="max-h-[410px]">
                      <CommandInput
                        name="search"
                        onValueChange={(val: string) => {
                          if (val.length !== 0) {
                            form.setValue('search', val)
                            // Immediately trigger form submit on input change
                            submitForm()
                          }
                        }}
                        placeholder={inputPlaceholder}
                      />
                      <CommandEmpty>No results found.</CommandEmpty>
                      <CommandGroup className="overflow-y-auto">
                        {items.map((item, i) => {
                          const { properties } = item || {}
                          const { pathname, headingId, heading, excerpt } = properties || {}
                          // const maxExcerptLength = 70
                          // const truncatedExcerpt = excerpt.length > maxExcerptLength ? `${excerpt.slice(0, maxExcerptLength)}...` : excerpt

                          return (
                            <CommandItem
                              className="items-start rounded max-h-14 mb-1 py-1 bg-white hover:bg-slate-50 cursor-pointer overflow-hidden"
                              key={i}
                              value={headingId}
                              onSelect={() => {
                                navigate(`${pathname}#${headingId}`)
                                setOpen(false)
                              }}
                            >
                              <div className="w-full flex flex-col justify-center space-y-1">
                                <div className="text-slate-900 font-medium">{heading}</div>
                                <div className="text-slate-600 truncate">{excerpt}</div>
                              </div>
                            </CommandItem>
                          )
                        })}
                      </CommandGroup>
                    </CommandList>
                  </FormControl>
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CommandDialog>
    </>
  )
}
