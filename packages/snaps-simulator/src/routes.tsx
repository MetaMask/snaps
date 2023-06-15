import { HandlerType } from '@metamask/snaps-utils';
import {
  createHashRouter,
  createRoutesFromElements,
  Navigate,
  Route,
} from 'react-router-dom';

import {
  Cronjobs,
  JsonRpc,
  Layout,
  Transactions,
  Handler,
  Manifest,
  Builder,
} from './features';

export const router = createHashRouter(
  createRoutesFromElements(
    <Route element={<Layout />}>
      <Route
        path="/"
        element={
          <Navigate
            to={`/handler/${HandlerType.OnRpcRequest}`}
            replace={true}
          />
        }
      />
      <Route path="/builder" element={<Builder />} />
      <Route path="/manifest" element={<Manifest />} />
      <Route path="/handler" element={<Handler />}>
        <Route
          path={`/handler/${HandlerType.OnRpcRequest}`}
          element={<JsonRpc />}
        />
        <Route
          path={`/handler/${HandlerType.OnCronjob}`}
          element={<Cronjobs />}
        />
        <Route
          path={`/handler/${HandlerType.OnTransaction}`}
          element={<Transactions />}
        />
      </Route>
    </Route>,
  ),
);
