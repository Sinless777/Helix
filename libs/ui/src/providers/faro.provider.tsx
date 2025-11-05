'use client';

import { type ReactNode, useEffect } from 'react';

import { initFaro } from '../utils/faro';

type FaroProviderProps = {
  children: ReactNode;
};

export function FaroProvider({ children }: FaroProviderProps) {
  useEffect(() => {
    initFaro();
  }, []);

  return children;
}

export default FaroProvider;
