import React from "react";
import { FiMenu, FiSettings, FiHelpCircle, FiSun, FiMoon, FiGrid } from "react-icons/fi";
import { useNavigate } from 'react-router-dom';

interface ChatHeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  isSidebarOpen,
  onToggleSidebar,
  isDarkMode = false,
  onToggleDarkMode,
}) => {
  const navigate = useNavigate();

  const handleNavigateToCards = () => {
    navigate('/cards');
  };

  return (
    <header className="flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200 dark:border-gray-700 shrink-0">
      <div className="flex items-center">
        <button
          onClick={onToggleSidebar}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          aria-label={isSidebarOpen ? "关闭侧边栏" : "打开侧边栏"}
        >
          <FiMenu className="w-6 h-6" />
        </button>
        <h1 className="ml-4 text-xl font-semibold">AI Chat</h1>
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={handleNavigateToCards}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          aria-label="查看卡片"
        >
          <FiGrid className="w-6 h-6" />
        </button>
        <button
          onClick={onToggleDarkMode}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          aria-label={isDarkMode ? "切换到亮色模式" : "切换到暗色模式"}
        >
          {isDarkMode ? (
            <FiSun className="w-6 h-6" />
          ) : (
            <FiMoon className="w-6 h-6" />
          )}
        </button>
        <button
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          aria-label="设置"
        >
          <FiSettings className="w-6 h-6" />
        </button>
        <button
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          aria-label="帮助"
        >
          <FiHelpCircle className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
};

export default ChatHeader;
