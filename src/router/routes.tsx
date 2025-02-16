import { Navigate, RouteObject } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { useStore } from '@/store/store';

// 懒加载组件
const AppLayout = lazy(() => import('@/pages/AppLayout.tsx'));
const Login = lazy(() => import('@/pages/Auth/Login.tsx'));
const Register = lazy(() => import('@/pages/Auth/Register.tsx'));
const Chat = lazy(() => import('@/pages/Chat/Chat.tsx'));

// 加载提示组件
const LoadingFallback = () => (
  <div className="flex h-screen w-screen items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
  </div>
);

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
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <PrivateRoute>
              <Chat />
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