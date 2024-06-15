import { create } from 'zustand'

interface TreeExpansionState {
  expanded: { [key: string]: boolean }
  setExpanded: (pathname: string, isExpanded: boolean) => void
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
  setExpanded: (pathname, isExpanded) =>
    set((state) => {
      return {
        ...state,
        expanded: {
          ...state.expanded,
          [pathname]: isExpanded,
        },
      }
    }),
  toggle: (pathname) =>
    set((state) => {
      return {
        ...state,
        expanded: {
          ...state.expanded,
          [pathname]: state.expanded[pathname] ? false : true,
        },
      }
    }),
}))
