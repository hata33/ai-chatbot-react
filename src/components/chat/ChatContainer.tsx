import React, { useState, useEffect } from 'react';
import { useChat } from '@/hooks/useChat';
import ChatHeader from './ChatHeader';
import ChatInput from './ChatInput';
import ChatMessages from './ChatMessages';
import Sidebar from '@/components/Sidebar';

const ChatContainer: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const {
    messages, 
    isFetching,
    chatSessions,
    messagesEndRef,
    chatContainerRef,
    sendMessage,
    handleKeyPress,
    handleSelectChat,
    createNewChat
  } = useChat();

  // 监听窗口大小变化
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 750;
      setIsMobile(mobile);
      // 在移动设备上默认关闭侧边栏
      if (mobile) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    // 初始检查
    checkMobile();

    // 添加窗口大小变化监听
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* 侧边栏 */}
      <div
        className={`${
          isMobile
            ? 'fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out'
            : 'flex-shrink-0'
        } ${
          isSidebarOpen
            ? isMobile
              ? 'translate-x-0'
              : 'w-64'
            : isMobile
              ? '-translate-x-full'
              : 'hidden'
        }`}
      >
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          chatSessions={chatSessions}
          onSelectChat={handleSelectChat}
          onCreateChat={createNewChat}
        />
      </div>

      {/* 遮罩层 */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 右侧内容区域 */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <ChatHeader
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* 聊天区域 */}
        <main className="flex-1 overflow-hidden bg-white dark:bg-gray-800">
          <ChatMessages
            messages={messages}
            isFetching={isFetching}
            messagesEndRef={messagesEndRef}
            chatContainerRef={chatContainerRef}
          />
        </main>

        {/* 底部输入区域 */}
        <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shrink-0">
          <ChatInput 
            isFetching={isFetching}
            onSendMessage={sendMessage}
            onKeyPress={handleKeyPress}
          />
        </footer>
      </div>
    </div>
  );
};

export default ChatContainer; 