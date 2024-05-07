import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { getHighlighter } from 'shiki'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function kebabToTitleCase(str: string) {
  return str
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ')
}

interface GetShikiHtmlArgs {
  code: string
  lang: string
  theme?: string
}

export async function getShikiHtml({ lang, code, theme }: GetShikiHtmlArgs) {
  const highlighter = await getHighlighter({
    themes: ['catppuccin-mocha', 'dark-plus'],
    langs: ['python', 'bash', 'shell'],
  })

  const html = highlighter.codeToHtml(code, { lang, theme: 'slack-dark' })
  return html
}
