import React, { createContext, useContext } from 'react';
import { TownLoaderData, JobLoaderData, SSRRouteData } from '../types';

interface SSRDataContextValue {
  initialData?: SSRRouteData | TownLoaderData | JobLoaderData | any | null;
}

const SSRDataContext = createContext<SSRDataContextValue>({});

export function SSRDataProvider({
  children,
  initialData,
}: {
  children: React.ReactNode;
  initialData?: SSRRouteData | TownLoaderData | JobLoaderData | any | null;
}) {
  return <SSRDataContext.Provider value={{ initialData }}>{children}</SSRDataContext.Provider>;
}

export function useSSRData(): SSRDataContextValue {
  return useContext(SSRDataContext);
}
