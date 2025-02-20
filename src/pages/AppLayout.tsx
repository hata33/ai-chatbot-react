import React from 'react';
import { Outlet } from 'react-router-dom';

const AppLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 w-full">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout; 