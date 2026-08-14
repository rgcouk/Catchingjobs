import React, { createContext, useContext } from 'react';
import { TownLoaderData } from '../types';

interface SSRDataContextValue {
  initialData?: TownLoaderData | null;
}

const SSRDataContext = createContext<SSRDataContextValue>({});

export function SSRDataProvider({
  children,
  initialData,
}: {
  children: React.ReactNode;
  initialData?: TownLoaderData | null;
}) {
  return <SSRDataContext.Provider value={{ initialData }}>{children}</SSRDataContext.Provider>;
}

export function useSSRData(): SSRDataContextValue {
  return useContext(SSRDataContext);
}
