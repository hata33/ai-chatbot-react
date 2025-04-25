import { RiRobot2Line } from 'react-icons/ri';
import MarkdownRenderer from './MarkdownRenderer';
import dayjs from 'dayjs';

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
}

// 消息组件
const ChatMessage: React.FC<ChatMessageProps> = ({ message, isDark = false}) => {
  const isAssistant = message.role === 'assistant';
  
  return (
    <div className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'} mb-4`}>
      <div
        className={`rounded-lg p-4 ${
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