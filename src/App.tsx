import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { routes } from '@/router/routes';
import '@/styles/globals.css';
import { Toaster } from 'sonner';

const router = createBrowserRouter(routes);

function App() {
  return (
    <div className="min-h-screen w-full">
      <Toaster position="top-center" richColors />
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
