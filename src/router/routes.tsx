import { Navigate, RouteObject } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { useStore } from '@/store/store';

// 错误边界组件
const ErrorBoundary = () => {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Oops! Something went wrong</h1>
        <p className="text-gray-600 mb-4">Please try refreshing the page</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
};

// 加载提示组件
const LoadingFallback = () => (
  <div className="flex h-screen w-screen items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
  </div>
);

// 懒加载组件
const AppLayout = lazy(() => import('@/pages/AppLayout'));
const Login = lazy(() => import('@/pages/Auth/Login'));
const Register = lazy(() => import('@/pages/Auth/Register'));
const Chat = lazy(() => import('@/pages/Chat/Chat'));
const Cards = lazy(() => import('@/pages/Cards/index'));
const Reflection = lazy(() => import('@/pages/Reflection/Reflection'));

// 路由守卫组件
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useStore((state) => state.token);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// 已登录用户访问登录页面重定向
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useStore((state) => state.token);

  if (token) {
    return <Navigate to="/chat" replace />;
  }

  return <>{children}</>;
};

// 路由配置
export const routes: RouteObject[] = [
  {
    path: '/',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <AppLayout />
      </Suspense>
    ),
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <Navigate to="/chat" replace />,
      },
      {
        path: 'login',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <PublicRoute>
              <Login />
            </PublicRoute>
          </Suspense>
        ),
      },
      {
        path: 'register',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <PublicRoute>
              <Register />
            </PublicRoute>
          </Suspense>
        ),
      },
      {
        path: 'chat',
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <PrivateRoute>
                  <Chat />
                </PrivateRoute>
              </Suspense>
            ),
          },
          {
            path: ':id',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <PrivateRoute>
                  <Chat />
                </PrivateRoute>
              </Suspense>
            ),
          },
        ],
      },
      {
        path: 'cards',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <PrivateRoute>
              <Cards />
            </PrivateRoute>
          </Suspense>
        ),
      },
      {
        path: 'reflection',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <PrivateRoute>
              <Reflection />
            </PrivateRoute>
          </Suspense>
        ),
      },
      {
        path: '*',
        element: <Navigate to="/chat" replace />,
      },
    ],
  },
]; 