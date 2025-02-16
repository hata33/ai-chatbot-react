import React from 'react';
import { Outlet } from 'react-router-dom';

const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-primary-500 text-white p-4">
        <h1 className="text-2xl">AI Chatbot</h1>
      </header>
      <main className="flex-grow p-4">
        <Outlet />
      </main>
      <footer className="bg-gray-800 text-white p-4 text-center">
        © 2024 AI Chatbot. All rights reserved.
      </footer>
    </div>
  );
};

export default AppLayout; 