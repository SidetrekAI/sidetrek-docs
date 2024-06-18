import React from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

interface MyAccordionProps {
  items: {
    id: string
    trigger: string
    content: string[]
  }[]
}

export default function MyAccordion({ items }: MyAccordionProps) {
  return (
    <Accordion type="single" collapsible className="w-full">
      {items?.map((item) => {
        return (
          <AccordionItem key={item.id} value={item.id}>
            <AccordionTrigger>{item.trigger}</AccordionTrigger>
            <AccordionContent>
              {item.content.map((line, i) => {
                return <div key={i} className="mb-2">{line}</div>
              })}
            </AccordionContent>
          </AccordionItem>
        )
      })}
    </Accordion>
  )
}
