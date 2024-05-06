import { Menu } from 'lucide-react'
import { Button } from './ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from './ui/drawer'
import { useState } from 'react'
import { TreeComponent } from './SideMenu'
import type { Tree } from '@/lib/types'

interface SideMenuMobileProps {
  tree: Tree[]
  currentPath: string
}

export default function SideMenuMobile({ tree, currentPath }: SideMenuMobileProps) {
  const [open, setOpen] = useState(false)

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger aria-label="Toggle Menu" asChild>
        <Button variant="ghost">
          <Menu />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Navigate to</DrawerTitle>
          <DrawerDescription>Select a page to navigate to.</DrawerDescription>
        </DrawerHeader>
        <div className="grid gap-1 pr-4">{TreeComponent({ tree, currentPath })}</div>
        <DrawerFooter className="pt-4">
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
