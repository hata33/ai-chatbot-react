import { CardItem, updateCard } from '@/api/card';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';

interface EditCardFormProps {
  card: CardItem;
  onUpdate: (card: CardItem) => void;
  onCancel: () => void;
}

const EditCardForm = ({ card, onUpdate, onCancel }: EditCardFormProps) => {
  const handleUpdate = async () => {
    try {
      const updatedCard = await updateCard(card.id, {
        title: card.title,
        content: card.content
      });
      onUpdate(updatedCard);
      toast.success('卡片更新成功');
    } catch (error) {
      toast.error('更新卡片失败');
      console.error('更新卡片失败:', error);
    }
  };

  return (
    <div className="space-y-4">
      <Input
        value={card.title}
        onChange={(e) => onUpdate({ ...card, title: e.target.value })}
        className="w-full text-base"
      />
      <Input
        value={card.content}
        onChange={(e) => onUpdate({ ...card, content: e.target.value })}
        className="w-full text-base"
      />
      <div className="flex gap-2">
        <Button 
          onClick={handleUpdate}
          className="flex-1"
        >
          确定
        </Button>
        <Button 
          onClick={onCancel}
          variant="outline"
          className="flex-1"
        >
          取消
        </Button>
      </div>
    </div>
  );
};

export default EditCardForm; 