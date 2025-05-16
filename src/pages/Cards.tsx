import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FiEdit2, FiTrash2, FiArrowLeft } from 'react-icons/fi';
import { toast } from 'sonner';
import { CardItem, getAllCards, createCard, updateCard, deleteCard } from '@/api/card';
import Card3DModal from '@/components/Card3DModal';

const Cards = () => {
  const navigate = useNavigate();
  // 状态管理
  const [cards, setCards] = useState<CardItem[]>([]);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [newCardContent, setNewCardContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingCard, setEditingCard] = useState<CardItem | null>(null);
  const [selectedCard, setSelectedCard] = useState<CardItem | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // 检测是否为移动设备
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 处理返回聊天页面
  const handleBackToChat = () => {
    navigate('/chat');
  };

  // 加载卡片列表
  const loadCards = async () => {
    try {
      setLoading(true);
      const data = await getAllCards();
      setCards(data);
    } catch (error) {
      toast.error('加载卡片失败');
      console.error('加载卡片失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    loadCards();
  }, []);

  // 处理新增卡片
  const handleAddCard = async () => {
    if (!newCardTitle.trim() || !newCardContent.trim()) {
      toast.error('标题和内容不能为空');
      return;
    }

    try {
      const newCard = await createCard({
        title: newCardTitle,
        content: newCardContent
      });
      setCards([newCard, ...cards]);
      setNewCardTitle('');
      setNewCardContent('');
      toast.success('卡片创建成功');
    } catch (error) {
      toast.error('创建卡片失败');
      console.error('创建卡片失败:', error);
    }
  };

  // 处理更新卡片
  const handleUpdateCard = async (card: CardItem) => {
    try {
      const updatedCard = await updateCard(card.id, {
        title: card.title,
        content: card.content
      });
      setCards(cards.map(c => c.id === card.id ? updatedCard : c));
      setEditingCard(null);
      toast.success('卡片更新成功');
    } catch (error) {
      toast.error('更新卡片失败');
      console.error('更新卡片失败:', error);
    }
  };

  // 处理删除卡片
  const handleDeleteCard = async (id: string) => {
    try {
      await deleteCard(id);
      setCards(cards.filter(card => card.id !== id));
      toast.success('卡片删除成功');
    } catch (error) {
      toast.error('删除卡片失败');
      console.error('删除卡片失败:', error);
    }
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (editingCard) {
        handleUpdateCard(editingCard);
      } else {
        handleAddCard();
      }
    }
  };

  // 处理卡片点击
  const handleCardClick = (card: CardItem) => {
    setSelectedCard(card);
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
      {/* 返回按钮 */}
      <div className="flex items-center mb-4">
        <button
          onClick={handleBackToChat}
          className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
          aria-label="返回聊天"
        >
          <FiArrowLeft className="w-5 h-5 mr-2" />
          <span>返回聊天</span>
        </button>
      </div>

      {/* 新增卡片表单 */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">新增卡片</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="请输入卡片标题"
            value={newCardTitle}
            onChange={(e) => setNewCardTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full text-base"
            disabled={loading}
          />
          <Input
            placeholder="请输入卡片内容"
            value={newCardContent}
            onChange={(e) => setNewCardContent(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full text-base"
            disabled={loading}
          />
          <Button 
            onClick={handleAddCard}
            className="w-full"
            disabled={loading}
          >
            {loading ? '添加中...' : '添加卡片'}
          </Button>
        </CardContent>
      </Card>

      {/* 卡片列表 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <Card 
            key={card.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleCardClick(card)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base sm:text-lg font-medium truncate max-w-[70%]">
                {editingCard?.id === card.id ? (
                  <Input
                    value={editingCard.title}
                    onChange={(e) => setEditingCard({ ...editingCard, title: e.target.value })}
                    onKeyDown={handleKeyDown}
                    className="w-full text-base"
                  />
                ) : (
                  card.title
                )}
              </CardTitle>
              <div className="flex space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingCard(card);
                  }}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  aria-label="编辑卡片"
                >
                  <FiEdit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCard(card.id);
                  }}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  aria-label="删除卡片"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              {editingCard?.id === card.id ? (
                <Input
                  value={editingCard.content}
                  onChange={(e) => setEditingCard({ ...editingCard, content: e.target.value })}
                  onKeyDown={handleKeyDown}
                  className="w-full text-base"
                />
              ) : (
                <p className="text-sm sm:text-base text-gray-600 line-clamp-3">{card.content}</p>
              )}
              <p className="text-xs sm:text-sm text-gray-400 mt-2">{card.createdAt}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 3D 卡片弹窗 */}
      <Card3DModal 
        card={selectedCard} 
        onClose={() => setSelectedCard(null)} 
      />
    </div>
  );
};

export default Cards; 