import { useState, useEffect } from 'react';
import { CardItem, getAllCards, deleteCard } from '@/api/card';
import { toast } from 'sonner';
import Card3DModal from '@/components/Card3DModal';
import BackButton from './components/BackButton';
import CardList from './components/CardList';
import CardEditor from './components/CardEditor';
import { Button } from '@/components/ui/button';
import { FiPlus } from 'react-icons/fi';

const Cards = () => {
  // 状态管理
  const [cards, setCards] = useState<CardItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CardItem | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CardItem | null>(null);

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

  // 处理卡片保存
  const handleCardSave = (card: CardItem) => {
    if (editingCard) {
      setCards(cards.map(c => c.id === card.id ? card : c));
    } else {
      setCards([card, ...cards]);
    }
    setEditingCard(null);
  };

  // 处理卡片删除
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

  // 处理编辑开始
  const handleEditStart = (card: CardItem) => {
    setEditingCard(card);
    setIsEditorOpen(true);
  };

  // 处理新建卡片
  const handleCreateCard = () => {
    setEditingCard(null);
    setIsEditorOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-7xl min-w-0 overflow-y-auto">
      <div className="flex items-center justify-between">
        <BackButton />
        <Button
          onClick={handleCreateCard}
          className="flex items-center gap-2"
        >
          <FiPlus className="w-4 h-4" />
          <span>新建卡片</span>
        </Button>
      </div>

      <CardList
        cards={cards}
        onDelete={handleDeleteCard}
        onSelect={setSelectedCard}
        onEditStart={handleEditStart}
      />

      {/* 卡片编辑器 */}
      <CardEditor
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingCard(null);
        }}
        onSave={handleCardSave}
        initialData={editingCard}
        loading={loading}
      />

      {/* 3D 卡片弹窗 */}
      <Card3DModal 
        card={selectedCard} 
        onClose={() => setSelectedCard(null)} 
      />
    </div>
  );
};

export default Cards; 