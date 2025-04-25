import { RiRobot2Line } from 'react-icons/ri';
import { FiCopy, FiEdit, FiTrash2, FiCheck } from 'react-icons/fi';
import MarkdownRenderer from './MarkdownRenderer';
import dayjs from 'dayjs';
import { useState } from 'react';

// 消息类型定义
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: string;
}

interface ChatMessageProps {
  message: Message;
  isDark?: boolean;
  onCopy?: (content: string) => void;
  onEdit?: (id: string, content: string) => void;
  onDelete?: (id: string) => void;
}

// 消息组件
const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  isDark = false,
  onCopy,
  onEdit,
  onDelete
}) => {
  const isAssistant = message.role === 'assistant';
  const [showActions, setShowActions] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    if (onCopy) {
      onCopy(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div 
      className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'} mb-4 group`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div
        className={`rounded-lg p-4 relative ${
          isAssistant
            ? `${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm w-full`
            : 'bg-primary-500 text-white ml-16'
        }`}
      >
        {isAssistant && (
          <div className="flex items-center mb-2">
            <RiRobot2Line className="w-6 h-6 mr-2" />
            <span className="font-semibold">AI Assistant</span>
          </div>
        )}
        
        <div className={isAssistant ? '' : 'text-white'}>
          <MarkdownRenderer 
            content={message.content} 
            isDark={isDark || !isAssistant}
          />
        </div>

        {/* 消息操作按钮 */}
        {showActions && (
          <div className={`absolute top-2 right-2 flex space-x-1 ${
            isAssistant ? 'bg-white dark:bg-gray-800' : 'bg-primary-500'
          } rounded-lg shadow-sm`}>
            <button
              onClick={handleCopy}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              aria-label="复制消息"
            >
              {copied ? (
                <FiCheck className="w-4 h-4 text-green-500" />
              ) : (
                <FiCopy className="w-4 h-4" />
              )}
            </button>
            {onEdit && (
              <button
                onClick={() => onEdit(message.id, message.content)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                aria-label="编辑消息"
              >
                <FiEdit className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(message.id)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                aria-label="删除消息"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {message.createdAt && (
        <div className="text-xs text-gray-400 mt-1">
          {dayjs(message.createdAt).format('YYYY-MM-DD HH:mm:ss')}
        </div>
      )}
    </div>
  );
};

export default ChatMessage; 