// NotificationModal.tsx
import { motion } from 'framer-motion'
import React from 'react'

interface Props {
  variant: 'info' | 'error' | 'success' | 'warn' | 'fatal'
  message: string
  onClose: () => void
}

const colors = {
  info: 'bg-blue-100 text-blue-800',
  success: 'bg-green-100 text-green-800',
  error: 'bg-red-100 text-red-800',
  warn: 'bg-yellow-100 text-yellow-800',
  fatal: 'bg-red-600 text-white',
}

export const NotificationModal: React.FC<Props> = ({
  variant,
  message,
  onClose,
}) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className={`fixed top-4 left-1/2 transform -translate-x-1/2 p-4 rounded shadow-lg ${colors[variant]}`}
    onClick={onClose}
  >
    {message}
  </motion.div>
)
