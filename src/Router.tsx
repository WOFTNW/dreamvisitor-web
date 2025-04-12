import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { HomePage } from './pages/Home.page';
import { ConsolePage } from './pages/Console.page';
import { ConfigPage } from './pages/Configuration.page';
import { UsersPage } from './pages/Users.page';
import { LoginPage } from './pages/Login.page';
import { ForgotPasswordPage } from './pages/ForgotPassword.page';
import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';

const ProtectedRoutes = () => {
  return (
    <ProtectedRoute>
      <HomePage />
    </ProtectedRoute>
  );
};

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <HomePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/console',
    element: (
      <ProtectedRoute>
        <ConsolePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/config',
    element: (
      <ProtectedRoute>
        <ConfigPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/users',
    element: (
      <ProtectedRoute>
        <UsersPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '*',
    element: <Navigate to="/" />,
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}
