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
import Sidebar from '@/components/Sidebar';

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chatSessions, setChatSessions] = useState<{ id: string; title: string }[]>([]);
  const [isMobile, setIsMobile] = useState(false);

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

  // 发送消息
  const sendMessage = async () => {
    if (!input.trim() || isFetching) return;
  
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim()
    };
  
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsFetching(true);
  
    try {
      const formattedMessages = [
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
      let assistantMessageId = Date.now().toString();
  
      // 先添加一个空的助理消息
      setMessages(prev => [...prev, {
        id: assistantMessageId,
        role: 'assistant',
        content: ''
      }]);
  
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
            assistantMessage += data.delta.content;
            
            // 更新现有的助理消息而不是创建新的
            setMessages(prev => prev.map(msg => 
              msg.id === assistantMessageId 
                ? { ...msg, content: assistantMessage } 
                : msg
            ));
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
      const response2 = await http.get(`/chat/list`);
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

  // 获取会话列表
  const fetchChatSessions = async () => {
    try {
      const response = await http.get('/chat/list');
      setChatSessions(response.data.chats || []);
    } catch (error) {
      console.error('获取会话列表失败:', error);
    }
  };

  // 处理会话选择
  const handleSelectChat = (id: string) => {
    navigate(`/chat/${id}`);
    setIsSidebarOpen(false);
  };

  // 在组件挂载时获取会话列表
  useEffect(() => {
    fetchChatSessions();
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
        {/* 顶部导航栏 */}
        <header className="flex items-center h-16 px-4 bg-white border-b border-gray-200 dark:border-gray-700 shrink-0">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <FiMenu className="w-6 h-6" />
          </button>
          <h1 className="ml-4 text-xl font-semibold">AI Chat</h1>
        </header>

        {/* 聊天区域 */}
        <main className="flex-1 overflow-hidden bg-white dark:bg-gray-800">
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
              className={`p-3 rounded-lg shrink-0 ${
                isFetching || !input.trim()
                  ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
                  : 'bg-primary-500 text-white hover:bg-primary-600'
              }`}
            >
              <FiSend className="w-6 h-6" />
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Chat;