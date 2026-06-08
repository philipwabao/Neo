import { createContext, useContext } from 'react'

export type OSApi = { openApp: (id: string) => void }

export const OSContext = createContext<OSApi>({ openApp: () => {} })

export const useOS = () => useContext(OSContext)
