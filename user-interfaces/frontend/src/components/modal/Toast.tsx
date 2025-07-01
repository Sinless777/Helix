// Toast.tsx
"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface ToastMessage {
  id: number;
  content: ReactNode;
}

interface ToastContextProps {
  addToast: (content: ReactNode) => void;
}

const ToastContext = createContext<ToastContextProps>({ addToast: () => {} });

export const useToast = () => useContext(ToastContext);

export const ToastContainer: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (content: ReactNode) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, content }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      3000,
    );
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 space-y-2">
        <AnimatePresence>
          {toasts.map(({ id, content }) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg shadow"
            >
              {content}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
