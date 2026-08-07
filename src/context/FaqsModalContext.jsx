import { createContext, useContext, useState } from 'react';

const FaqsModalContext = createContext(null);

export function FaqsModalProvider({ children }) {
  const [open, setOpen] = useState(false);

  const value = {
    open,
    openModal: () => setOpen(true),
    closeModal: () => setOpen(false),
  };

  return (
    <FaqsModalContext.Provider value={value}>
      {children}
    </FaqsModalContext.Provider>
  );
}

export function useFaqsModal() {
  const ctx = useContext(FaqsModalContext);
  if (!ctx) {
    throw new Error('useFaqsModal debe usarse dentro de un FaqsModalProvider');
  }
  return ctx;
}