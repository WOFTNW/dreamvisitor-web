import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { HomePage } from './pages/Home.page';
import { ConsolePage } from './pages/Console.page';
import { ConfigPage } from './pages/Configuration.page';
import { UsersPage } from './pages/Users.page';

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/console',
    element: <ConsolePage />
  },
  {
    path: '/config',
    element: <ConfigPage />
  },
  {
    path: '/users',
    element: <UsersPage />
  }
]);

export function Router() {
  return <RouterProvider router={router} />;
}
