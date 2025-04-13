import React from 'react';
import { RiRobot2Line } from 'react-icons/ri';
import ChatMessage, { Message } from '@/components/ChatMessage';

interface ChatMessagesProps {
  messages: Message[];
  isFetching: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  chatContainerRef: React.RefObject<HTMLDivElement | null>;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  isFetching,
  messagesEndRef,
  chatContainerRef
}) => {
  return (
    <div
      ref={chatContainerRef}
      className="h-full overflow-y-auto px-4 py-6 space-y-6"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {messages.map(message => (
          <ChatMessage
            key={message.id}
            message={message}
            isDark={false}
          />
        ))}
        {isFetching && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm">
              <div className="flex items-center">
                <RiRobot2Line className="w-6 h-6 mr-2" />
                <div className="h-2 w-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatMessages; 