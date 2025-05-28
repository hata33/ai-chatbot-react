import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CardItem, createCard } from '@/api/card';
import { toast } from 'sonner';

interface CardFormProps {
  onCardCreated: (card: CardItem) => void;
  loading: boolean;
}

const CardForm = ({ onCardCreated, loading }: CardFormProps) => {
  const [newCardTitle, setNewCardTitle] = useState('');
  const [newCardContent, setNewCardContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 处理输入变化
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNewCardContent(value);
    if (textareaRef.current) {
      textareaRef.current.value = value;
    }
  };

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
      onCardCreated(newCard);
      setNewCardTitle('');
      setNewCardContent('');
      toast.success('卡片创建成功');
    } catch (error) {
      toast.error('创建卡片失败');
      console.error('创建卡片失败:', error);
    }
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddCard();
    }
  };

  return (
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
        <Textarea
          ref={textareaRef}
          placeholder="请输入卡片内容"
          value={newCardContent}
          onChange={handleContentChange}
          className="w-full min-h-[100px] max-h-[200px] resize-none"
          style={{ height: textareaRef.current?.style.height }}
          autoHeight={true}
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
  );
};

export default CardForm; 