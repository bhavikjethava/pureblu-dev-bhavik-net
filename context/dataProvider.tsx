'use client';
import Loader from '@/components/Loader';
import React, {
  FC,
  ReactNode,
  createContext,
  useContext,
  useState,
} from 'react';

interface DataProviderProps {
  children: ReactNode;
}

interface DataProps {
  setData: (data: any) => void;
  [key: string]: any;
}

const initState = {} as DataProps;
const DataContext = createContext<DataProps>(initState);

const DataProvider: FC<DataProviderProps> = ({ children }) => {
  const [state, setState] = useState<DataProps>(initState);

  const setData = (data: any) => {
    setState((preData) => {
      return {
        ...preData,
        ...data,
      };
    });
  };

  return (
    <DataContext.Provider value={{ state, setData }}>
      {children}
      {state.isLoading ? <Loader /> : null}
    </DataContext.Provider>
  );
};

export { DataProvider, DataContext };
