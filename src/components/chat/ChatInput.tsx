import React from 'react';
import { FiSend } from 'react-icons/fi';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  isFetching: boolean;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  isFetching,
  onSendMessage,
  onKeyPress
}) => {
  return (
    <div className="max-w-4xl mx-auto flex space-x-4">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={onKeyPress}
        placeholder="输入消息..."
        className="flex-1 p-3 border border-gray-200 dark:border-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
        rows={1}
        aria-label="消息输入框"
      />
      <button
        onClick={onSendMessage}
        disabled={isFetching || !input.trim()}
        className={`p-3 rounded-lg shrink-0 ${
          isFetching || !input.trim()
            ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
            : 'bg-primary-500 text-white hover:bg-primary-600'
        }`}
        aria-label="发送消息"
      >
        <FiSend className="w-6 h-6" />
      </button>
    </div>
  );
};

export default ChatInput; 