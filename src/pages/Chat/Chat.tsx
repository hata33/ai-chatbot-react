import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Highlight, themes } from 'prism-react-renderer';
import { throttle } from 'lodash';
import { useStore } from '@/store/store';
import { FiMenu, FiSend } from 'react-icons/fi';
import { RiRobot2Line } from 'react-icons/ri';
import { toast } from 'sonner';
import { useParams, useNavigate } from 'react-router-dom';
import { http } from '@/utils/request';
import { generateUUID } from '@/utils/utils';
import ChatMessage, { Message } from '@/components/ChatMessage';

interface CodeProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const Chat: React.FC = () => {
  // 状态管理
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Store
  const { currentModel, setCurrentModel, token } = useStore();
  const navigate = useNavigate();

  const { id: urlId } = useParams<{ id: string }>();
  const chatId = useRef(urlId || generateUUID());
  // 组件挂载时，如果 URL 中没有 ID，则更新 URL
  useEffect(() => {
    if (!urlId) {
      console.log(chatId)
      window.history.replaceState({}, '', `/chat/${chatId.current}`);
    }
  }, []);
  // 自动滚动处理
  const scrollToBottom = throttle(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, 100);

  // 监听滚动
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 10;
      setAutoScroll(isBottom);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);
  // 发送消息
  const sendMessage = async () => {
    if (!input.trim() || isFetching) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim()
    };

    setMessages(prev => [...prev.slice(-3), userMessage]);
    setInput('');
    setIsFetching(true);

    try {
      // 转换消息格式
      const formattedMessages = [
        // { role: "system", content: "You are a helpful assistant." },
        ...messages.map(msg => ({ role: msg.role, content: msg.content })),
        { role: userMessage.role, content: userMessage.content }
      ];

      const response = await http.stream('chat', {
        messages: formattedMessages,
        model: "deepseek-chat",
        id: chatId.current,
      });

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response reader');

      let assistantMessage = '';
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);

        const lines = chunk.split('\n\n').filter((line) => line.trim());
        for (const line of lines) {
          if (line.startsWith('data:')) {
            if (line.slice(6) === '[DONE]') {
              break;
            }
            const data = JSON.parse(line.slice(5).trim());
            console.log(line.slice(6), 'line.slice(6)', data, 'data');
            assistantMessage += data.delta.content;
            setMessages((prev: any) => {
              const lastMessage = prev[prev.length - 1];
              if (lastMessage?.role === 'assistant') {
                return [...prev.slice(0, -1), { id: Date.now().toString(), role: 'assistant', content: assistantMessage }];
              } else {
                return [...prev, { id: Date.now().toString(), role: 'assistant', content: assistantMessage }];
              }
            });
          }
        }
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || '发送消息失败，请稍后重试');
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: '抱歉，发生了错误，请稍后重试。'
      }]);
    } finally {
      setIsFetching(false);
    }
  };
  // 处理按键事件
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  // 自动滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 获取历史消息
  const fetchHistoryMessages = async (chatId: string) => {
    try {
      const response = await http.get(`/chat/getMessageListById/${chatId}`);
      if (response.data) {
        setMessages(response.data.map((i: any) => {
          return { role: i.role, content: i.content }
        }));
      }
    } catch (error: any) {
      toast.error(error.message || '获取历史消息失败');
      console.error('获取历史消息失败:', error);
    }
  };

  // 在组件挂载时获取历史消息
  useEffect(() => {
    if (urlId) {
      fetchHistoryMessages(urlId);
    }
  }, [urlId]);

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* 顶部导航栏 */}
      <header className="flex items-center h-16 px-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shrink-0">
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
          <FiMenu className="w-6 h-6" />
        </button>
        <h1 className="ml-4 text-xl font-semibold">AI Chat</h1>
      </header>
      {/* 主要聊天区域 */}
      <main className="flex-1 overflow-hidden">
        {/* 消息列表容器 */}
        <div
          ref={chatContainerRef}
          className="h-full overflow-y-auto px-4 py-6 space-y-6"
        >
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map(message => (
              <ChatMessage
                key={message.id}
                message={message}
                isDark={false/* 根据您的主题状态传入 */}
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
      </main>
      {/* 底部输入区域 */}
      <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shrink-0">
        <div className="max-w-4xl mx-auto flex space-x-4">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入消息..."
            className="flex-1 p-3 border border-gray-200 dark:border-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            rows={1}
          />
          <button
            onClick={sendMessage}
            disabled={isFetching || !input.trim()}
            className={`p-3 rounded-lg shrink-0 ${isFetching || !input.trim()
              ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
              : 'bg-primary-500 text-white hover:bg-primary-600'
              }`}
          >
            <FiSend className="w-6 h-6" />
          </button>
        </div>
      </footer>
    </div>
  );
};

export default Chat;