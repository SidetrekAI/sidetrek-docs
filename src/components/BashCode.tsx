import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Check, Clipboard } from 'lucide-react'
import { useState } from 'react'

interface BashCodeProps {
  code: string
  clipboardCopy?: string // overwrites code to be copied to clipboard
}

export default function BashCode({ code, clipboardCopy }: BashCodeProps) {
  const [copied, setCopied] = useState<boolean>(false)

  const lines = code?.split('\\n')

  const handleCopy = () => {
    // Copy to clipboard
    const codeToCopy = clipboardCopy || code
    navigator.clipboard.writeText(codeToCopy)
    setCopied(true)

    setTimeout(() => {
      setCopied(false)
    }, 3000)
  }

  return (
    <ScrollArea className="relative whitespace-nowrap w-full bg-[#181827] px-4 py-4 mb-6 rounded text-[0.85rem] text-white font-mono leading-5">
      <div className="pr-12">
        {lines.map((line, i) => (
          <div key={i}>
            {i === 0 ? (
              <div className="flex items-center space-x-2">
                <div className="text-indigo-400 font-medium">$</div>
                <div>{line}</div>
              </div>
            ) : (
              <div>{line}</div>
            )}
          </div>
        ))}
      </div>

      <div
        className="absolute top-1 right-3 py-2 pr-0 pl-4 text-white/90 bg-[#181827] cursor-pointer"
        onClick={handleCopy}
      >
        <div className="hover:bg-white/30 rounded p-2">{copied ? <Check size={12} /> : <Clipboard size={12} />}</div>
      </div>
      <ScrollBar orientation="horizontal" thumbClassName="bg-white/40" />
    </ScrollArea>
  )
}
