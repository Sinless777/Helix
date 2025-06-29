// PopupModal.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface Props {
  type: 'Notice' | 'Card' | 'Form';
  content: React.ReactNode;
  onClose: () => void;
}

export const PopupModal: React.FC<Props> = ({ type, content, onClose }) => (
  <>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50"
      onClick={onClose}
    />
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl p-6 shadow-lg max-w-lg w-full"
    >
      <h2 className="text-xl font-semibold mb-4">{type}</h2>
      <div>{content}</div>
    </motion.div>
  </>
);