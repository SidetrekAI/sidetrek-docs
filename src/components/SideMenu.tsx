import { useEffect, useState } from 'react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronRight } from 'lucide-react'
import type { Tree } from '@/lib/types'
import { FOOTER_HEIGHT, HEADER_HEIGHT } from '@/lib/constants'
import { useMediaQuery } from 'usehooks-ts'
import { ScrollArea, ScrollBar } from './ui/scroll-area'

const TREE_LEFT_PADDING = 16

interface SideMenuItemProps {
  item: Tree
  level: number
  isActive: boolean
}

function SideMenuItem({ item, level, isActive }: SideMenuItemProps) {
  return (
    <li
      className={`w-full mb-3 hover:text-slate-900 transition-color cursor-pointer ${
        level > 0 && 'hover:border-l-2 hover:border-pink-400'
      } ${isActive && 'text-slate-900 font-medium border-l-2 border-pink-400'}`}
      style={{
        paddingLeft: `${isActive ? TREE_LEFT_PADDING - 2 : TREE_LEFT_PADDING}px`,
        marginLeft: `-${TREE_LEFT_PADDING + 1.5}px`,
      }}
    >
      {item.tree ? <div>{item.label}</div> : <a href={item.href}>{item.label}</a>}
    </li>
  )
}

interface GetTreeArgs {
  tree: Tree[]
  level?: number
  currentPath: string
}

export const TreeComponent = ({ tree, level = 0, currentPath }: GetTreeArgs) => {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const [openIds, setOpenIds] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    // Open the first level of the tree by default
    if (level === 0 && isDesktop) {
      const idsToOpen = tree.reduce((acc, curr, index) => ({ ...acc, [`${level}-${index}`]: true }), {})
      setOpenIds(idsToOpen)
    }
  }, [])

  const toggleOpen = (id: string) => {
    setOpenIds({ ...openIds, [id]: id in openIds ? !openIds[id] : true })
  }

  return (
    <ul
      className={level > 0 ? 'border-l border-slate-200 my-1.5 mt-0' : ''}
      style={{ paddingLeft: `${TREE_LEFT_PADDING}px` }}
    >
      {tree?.map((treeItem, index) => {
        const itemId = `${level}-${index}`
        const subtree = treeItem.tree
        const isActive = treeItem.href === currentPath

        if (subtree) {
          const subtreeUI = TreeComponent({ tree: subtree, level: level + 1, currentPath })
          const isOpen = openIds[itemId] === true

          return (
            <div key={itemId}>
              <Collapsible open={isOpen} onOpenChange={() => toggleOpen(itemId)}>
                <CollapsibleTrigger className="w-full text-left">
                  <div className="w-full flex items-center justify-between">
                    <SideMenuItem item={treeItem} level={level} isActive={isActive} />
                    <div className="mb-3">
                      <div className={`${isOpen ? 'rotate-90' : ''} transition-transform`}>
                        <ChevronRight size={16} strokeWidth={1.5} />
                      </div>
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>{subtreeUI}</CollapsibleContent>
              </Collapsible>
            </div>
          )
        } else {
          return <SideMenuItem key={index} item={treeItem} level={level} isActive={isActive} />
        }
      })}
    </ul>
  )
}

interface SideMenuProps {
  tree: Tree[]
  currentPath: string
}

export default function SideMenu({ tree, currentPath }: SideMenuProps) {
  return (
    <div className="relative w-[300px]">
      <aside
        className="fixed w-full shrink-0 text-sm text-slate-600"
        style={{ top: `${HEADER_HEIGHT}px`, width: 'inherit', height: `calc(100vh - ${HEADER_HEIGHT + FOOTER_HEIGHT}px)` }}
      >
        <ScrollArea className="h-full pl-4 pr-6 py-6">
          {TreeComponent({ tree, currentPath })}
        </ScrollArea>
      </aside>
    </div>
  )
}
