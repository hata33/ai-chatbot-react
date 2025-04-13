import React from 'react';
import { FiMenu } from 'react-icons/fi';

interface ChatHeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ isSidebarOpen, onToggleSidebar }) => {
  return (
    <header className="flex items-center h-16 px-4 bg-white border-b border-gray-200 dark:border-gray-700 shrink-0">
      <button 
        onClick={onToggleSidebar}
        className="p-2 hover:bg-gray-100 rounded-lg"
        aria-label={isSidebarOpen ? "关闭侧边栏" : "打开侧边栏"}
      >
        <FiMenu className="w-6 h-6" />
      </button>
      <h1 className="ml-4 text-xl font-semibold">AI Chat12</h1>
    </header>
  );
};

export default ChatHeader; 