import { useState, useEffect, useCallback } from 'react'
import { Box, Lightbulb, LoaderCircle, Search } from 'lucide-react'
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

const suggestions = [
  {
    heading: 'Get started with Sidetrek',
    headingId: 'get-started-with-sidetrek',
    pathname: '/get-started/overview',
  },
]

interface SearchBarProps {
  inputPlaceholder?: string
}

export function SearchBar({ inputPlaceholder = 'Search the docs...' }: SearchBarProps) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<any[]>([])

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

  const [isLoading, setIsLoading] = useState(false)
  const onSubmit = useCallback(
    debounce(async (formData: SearchFormData) => {
      setIsLoading(true)
      const res = await fetch(`/api/search`, {
        method: 'POST',
        body: JSON.stringify({ searchQuery: formData.search }),
      })

      const data = await res.json()
      setItems(data)
      setIsLoading(false)
    }, 200),
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
      {/* Mobile */}
      <div className="block md:hidden">
        <button
          className="p-2 text-slate-500 hover:text-slate-700"
          onClick={(e) => {
            e.preventDefault()
            setOpen((open) => !open)
          }}
        >
          <Search size={20} />
        </button>
      </div>
      {/* end: Mobile */}

      {/* Desktop */}
      <div className="hidden md:block">
        <div
          className="w-[240px] h-8 flex items-center bg-slate-100 rounded-md px-2 py-1 text-sm text-slate-400 cursor-pointer"
          onClick={(e) => {
            e.preventDefault()
            setOpen((open) => !open)
          }}
        >
          <div className="grow flex items-center space-x-1">
            <Search size={16} />
            <span>{inputPlaceholder}</span>
          </div>
          <div>⌘K</div>
        </div>
      </div>
      {/* end: Desktop */}

      <CommandDialog open={open} onOpenChange={setOpen} shouldFilter={false}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="search"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormControl>
                    <CommandList className="max-h-[410px] mt-[3.25rem]">
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

                      {isLoading && (
                        <div className="p-2 flex items-center space-x-1 pb-3 ml-2 text-sm text-slate-400">
                          <LoaderCircle size={14} className="animate-spin" />
                          <span>Loading search results...</span>
                        </div>
                      )}

                      <CommandGroup heading="Search results" className={!items || items.length === 0 ? 'hidden' : ''}>
                        {items.map((item, i) => {
                          const { properties } = item || {}
                          const { pathname, headingId, heading, excerpt } = properties || {}
                          console.log('pathname', pathname)
                          console.log('headingId', headingId)
                          const uniqueId = `${pathname}-${headingId}`
                          // const maxExcerptLength = 70
                          // const truncatedExcerpt = excerpt.length > maxExcerptLength ? `${excerpt.slice(0, maxExcerptLength)}...` : excerpt

                          return (
                            <CommandItem
                              className="items-start rounded max-h-[84px] mb-1 px-1 py-1 bg-white hover:bg-slate-50 overflow-hidden"
                              key={uniqueId}
                              value={headingId}
                              onSelect={() => {
                                navigate(`${pathname}#${headingId}`)
                                setOpen(false)
                              }}
                            >
                              <div className="w-full flex items-center space-x-2.5 cursor-pointer">
                                <div className="shrink-0 text-indigo-400">
                                  <Box size={24} strokeWidth={1} />
                                </div>
                                <div className="w-full min-w-0 flex flex-col justify-center space-y-1">
                                  <div className="text-slate-900 font-medium truncate">{heading}</div>
                                  <div className="text-slate-500 text-xs">{pathname}</div>
                                  {excerpt && <div className="text-slate-500 font-normal truncate">{excerpt}</div>}
                                </div>
                              </div>
                            </CommandItem>
                          )
                        })}
                      </CommandGroup>
                      <CommandGroup heading="Suggestions">
                        {suggestions.map((suggestion, i) => {
                          const { heading, headingId, pathname } = suggestion
                          const uniqueId = `${pathname}-${headingId}`
                          return (
                            <CommandItem
                              key={uniqueId}
                              className="items-start rounded max-h-[60px] mb-1 px-1 py-1 bg-white hover:bg-slate-50 overflow-hidden"
                              onSelect={() => {
                                navigate(`${pathname}`)
                                setOpen(false)
                              }}
                            >
                              <div className="w-full flex items-center space-x-2.5">
                                <div className="shrink-0 text-amber-500">
                                  <Lightbulb size={24} strokeWidth={1} />
                                </div>
                                <div className="w-full min-w-0">
                                  <div className="text-slate-900 font-medium truncate">{heading}</div>
                                </div>
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
