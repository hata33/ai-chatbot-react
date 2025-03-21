import { RiRobot2Line } from 'react-icons/ri';
import MarkdownRenderer from './MarkdownRenderer';

// 消息类型定义
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatMessageProps {
  message: Message;
  isDark?: boolean;
}

// 消息组件
const ChatMessage: React.FC<ChatMessageProps> = ({ message, isDark = false}) => {
  const isAssistant = message.role === 'assistant';
  
  return (
    <div className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`max-w-[80%] rounded-lg p-4 ${
          isAssistant
            ? `${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`
            : 'bg-primary-500 text-white'
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
    </div>
  );
};

export default ChatMessage; 