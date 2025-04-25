import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { http } from '@/utils/request';
import { generateUUID } from '@/utils/utils';
import { Message } from '@/components/ChatMessage';
import { useStore } from '@/store/store';

export const useChat = () => {
  // 状态管理
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [chatSessions, setChatSessions] = useState<{ id: string; title: string }[]>([]);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const { id: urlId } = useParams<{ id: string }>();
  const { currentChatId, setCurrentChatId } = useStore();
  const chatId = useRef(urlId || currentChatId || generateUUID());

  // 监听 URL 变化，更新当前对话 ID
  useEffect(() => {
    if (urlId) {
      setCurrentChatId(urlId);
      chatId.current = urlId;
      // 清空当前消息列表
      setMessages([]);
      // 获取新对话的历史消息
      fetchHistoryMessages(urlId);
    }
  }, [urlId, setCurrentChatId]);

  // 组件挂载时，如果 URL 中没有 ID，则更新 URL
  useEffect(() => {
    if (!urlId) {
      const newChatId = currentChatId || generateUUID();
      chatId.current = newChatId;
      setCurrentChatId(newChatId);
      navigate(`/chat/${newChatId}`, { replace: true });
    }
  }, [urlId, currentChatId, setCurrentChatId, navigate]);

  // 自动滚动处理
  const scrollToBottom = () => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

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

      setMessages(prev => [...prev, {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
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

            setMessages(prev => prev.map(msg =>
              msg.id === assistantMessageId
                ? { ...msg, content: assistantMessage }
                : msg
            ));
          }
        }
      }

      // 清空草稿
      localStorage.removeItem(`chat_draft_${chatId.current}`);
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
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // 检查是否是 Ctrl + Enter 组合键
    if (e.code === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      if (!isFetching && input.trim()) {
        sendMessage();
      }
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
          return { role: i.role, content: i.content, createdAt: i.createdAt }
        }));
      }
    } catch (error: any) {
      toast.error(error.message || '获取历史消息失败');
      console.error('获取历史消息失败:', error);
    }
  };

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
    setCurrentChatId(id);
    navigate(`/chat/${id}`);
  };

  // 在组件挂载时获取会话列表
  useEffect(() => {
    fetchChatSessions();
  }, []);

  return {
    messages,
    input,
    setInput,
    isFetching,
    chatSessions,
    messagesEndRef,
    chatContainerRef,
    sendMessage,
    handleKeyPress,
    handleSelectChat,
    chatId: chatId.current
  };
}; 