import { Children, type ReactNode } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'

interface Tab {
  label: string
  value: string
  content: ReactNode
  default?: boolean
}

interface MyTabsProps {
  variant?: 'default' | 'underline'
  tabs: Tab[]
}

export default function MyTabs({ variant = 'default', tabs }: MyTabsProps) {
  const tabsClassName = variant === 'underline' ? 'relative mr-auto w-full' : ''
  const tabsListClassName =
    variant === 'underline' ? 'w-full justify-start rounded-none border-b bg-transparent p-0' : ''
  const tabsTriggerClassName =
    variant === 'underline'
      ? 'relative rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold hover:text-slate-900 text-muted-foreground shadow-none transition-none focus-visible:ring-0 data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none'
      : ''

  const defaultValue = tabs.find((tab) => tab.default)?.value || tabs[0].value

  return (
    <Tabs className={tabsClassName} defaultValue={defaultValue}>
      <TabsList className={tabsListClassName}>
        {tabs.map((tab, i) => (
          <TabsTrigger key={i} value={tab.value} className={tabsTriggerClassName}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <div className="mt-4">
        {tabs.map((tab, i) => (
          <TabsContent key={i} value={tab.value}>
            {tab.content}
          </TabsContent>
        ))}
      </div>
    </Tabs>
  )
}
