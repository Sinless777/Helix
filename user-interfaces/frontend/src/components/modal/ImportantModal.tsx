// ImportantModal.tsx
import React from "react";
import { motion } from "framer-motion";

interface Props {
  content: React.ReactNode;
  onAcknowledge: () => void;
}

export const ImportantModal: React.FC<Props> = ({ content, onAcknowledge }) => (
  <>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.7 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.7 }}
        className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full text-center"
      >
        <div className="mb-6">{content}</div>
        <button
          onClick={onAcknowledge}
          className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
        >
          Acknowledge
        </button>
      </motion.div>
    </motion.div>
  </>
);
