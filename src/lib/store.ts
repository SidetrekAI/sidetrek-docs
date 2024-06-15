import { create } from 'zustand'

interface TreeExpansionState {
  expanded: { [key: string]: boolean }
  toggle: (pathname: string) => void
}

const initialExpandedState = {
  '/get-started': true,
  '/tutorials': true,
  '/guides': true,
  '/api': true,
}

export const useTreeExpansionStore = create<TreeExpansionState>((set) => ({
  expanded: initialExpandedState,
  toggle: (pathname) =>
    set((state) => ({
      ...state,
      expanded: { 
        ...state.expanded,
        [pathname]: !state.expanded[pathname] 
      },
    })),
}))
