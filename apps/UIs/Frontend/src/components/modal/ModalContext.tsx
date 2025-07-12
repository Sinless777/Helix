// ModalContext.tsx
'use client'

import { AnimatePresence, motion } from 'framer-motion'
import React, { createContext, ReactNode, useContext, useState } from 'react'
import { ImportantModal } from './ImportantModal'
import { NotificationModal } from './NotificationModal'
import { PopupModal } from './PopupModal'

type ModalType =
  | {
      kind: 'notification'
      variant: 'info' | 'error' | 'success' | 'warn' | 'fatal'
      message: string
    }
  | { kind: 'popup'; type: 'Notice' | 'Card' | 'Form'; content: ReactNode }
  | { kind: 'important'; content: ReactNode; onAcknowledge: () => void }

interface ModalContextProps {
  showModal: (modal: ModalType) => void
  hideModal: () => void
}

const ModalContext = createContext<ModalContextProps>({
  showModal: () => {},
  hideModal: () => {},
})

export const useModal = () => useContext(ModalContext)

export const ModalProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [modal, setModal] = useState<ModalType | null>(null)

  const showModal = (m: ModalType) => setModal(m)
  const hideModal = () => setModal(null)

  return (
    <ModalContext.Provider value={{ showModal, hideModal }}>
      {children}
      <AnimatePresence>
        {modal?.kind === 'notification' && (
          <NotificationModal {...modal} onClose={hideModal} />
        )}
        {modal?.kind === 'popup' && (
          <PopupModal {...modal} onClose={hideModal} />
        )}
        {modal?.kind === 'important' && (
          <ImportantModal
            {...modal}
            onAcknowledge={() => {
              modal.onAcknowledge()
              hideModal()
            }}
          />
        )}
      </AnimatePresence>
    </ModalContext.Provider>
  )
}
