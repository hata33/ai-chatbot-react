import React, { useState } from 'react';
import { useStore } from '@/store/store';
import { useNavigate } from 'react-router-dom';
import { FiLogOut, FiMessageSquare } from 'react-icons/fi';
import { toast } from 'sonner';

interface ChatSession {
  id: string;
  title: string;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  chatSessions: ChatSession[];
  onSelectChat: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, chatSessions, onSelectChat }) => {
  const { user, logout } = useStore();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // 处理退出登录
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      toast.success('已成功退出登录');
    } catch (error) {
      toast.error('退出登录失败');
    }
  };

  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* 会话列表 */}
        <div className="flex-1 overflow-y-auto p-4">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">会话列表</h2>
          <div className="space-y-2">
            {chatSessions.map((session) => (
              <button
                key={session.id}
                onClick={() => onSelectChat(session.id)}
                className="w-full flex items-center p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <FiMessageSquare className="w-5 h-5 mr-2" />
                <span className="truncate">{session.title || '新会话'}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 账户管理区域 */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="relative">
            <button
              onClick={() => setShowLogoutConfirm(!showLogoutConfirm)}
              className="w-full flex items-center justify-between p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <div className="flex items-center">
                <span className="truncate">{user?.email || '未登录'}</span>
              </div>
              <FiLogOut className="w-5 h-5" />
            </button>

            {/* 退出确认弹窗 */}
            {showLogoutConfirm && (
              <div className="absolute bottom-16 left-0 right-0 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
                <p className="text-gray-700 dark:text-gray-300 mb-4">确定要退出登录吗？</p>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowLogoutConfirm(false)}
                    className="px-3 py-1 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-1 bg-red-500 text-white hover:bg-red-600 rounded"
                  >
                    退出
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 