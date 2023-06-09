import { FunctionComponent, useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';

import { setSnapId } from './features';
import { useDispatch } from './hooks';
import { router } from './routes';

export const App: FunctionComponent = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    // Dispatch to start polling the default URL
    dispatch(setSnapId('local:http://localhost:8080'));
  }, [dispatch]);
  return <RouterProvider router={router} />;
};
