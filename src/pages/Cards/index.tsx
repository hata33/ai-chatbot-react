import { useState, useEffect } from 'react';
import { CardItem, getAllCards, deleteCard } from '@/api/card';
import { toast } from 'sonner';
import Card3DModal from '@/components/Card3DModal';
import BackButton from './components/BackButton';
import CardForm from './components/CardForm';
import CardList from './components/CardList';

const Cards = () => {
  // 状态管理
  const [cards, setCards] = useState<CardItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<CardItem | null>(null);

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

  // 处理卡片创建
  const handleCardCreated = (newCard: CardItem) => {
    setCards([newCard, ...cards]);
  };

  // 处理卡片更新
  const handleCardUpdate = (updatedCard: CardItem) => {
    setCards(cards.map(c => c.id === updatedCard.id ? updatedCard : c));
    setEditingCardId(null);
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
    setEditingCardId(card.id);
  };

  // 处理编辑取消
  const handleEditCancel = () => {
    setEditingCardId(null);
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-7xl min-w-0 overflow-y-auto">
      <BackButton />
      
      <CardForm 
        onCardCreated={handleCardCreated}
        loading={loading}
      />

      <CardList
        cards={cards}
        onUpdate={handleCardUpdate}
        onDelete={handleDeleteCard}
        onSelect={setSelectedCard}
        editingCardId={editingCardId}
        onEditStart={handleEditStart}
        onEditCancel={handleEditCancel}
      />

      <Card3DModal 
        card={selectedCard} 
        onClose={() => setSelectedCard(null)} 
      />
    </div>
  );
};

export default Cards; 