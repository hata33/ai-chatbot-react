import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { FiHome, FiSettings, FiHelpCircle } from 'react-icons/fi';

const AppLayout: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen">
      {/* 顶部导航栏 */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <button
                  onClick={() => navigate('/')}
                  className="text-gray-800 dark:text-gray-200 hover:text-gray-600 dark:hover:text-gray-400"
                >
                  <FiHome className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/settings')}
                className="text-gray-800 dark:text-gray-200 hover:text-gray-600 dark:hover:text-gray-400"
                aria-label="设置"
              >
                <FiSettings className="w-6 h-6" />
              </button>
              <button
                onClick={() => navigate('/help')}
                className="text-gray-800 dark:text-gray-200 hover:text-gray-600 dark:hover:text-gray-400"
                aria-label="帮助"
              >
                <FiHelpCircle className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout; 