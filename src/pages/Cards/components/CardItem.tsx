import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { CardItem as CardItemType } from '@/api/card';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

dayjs.locale('zh-cn');

interface CardItemProps {
  card: CardItemType;
  onDelete: (id: string) => void;
  onSelect: (card: CardItemType) => void;
  onEditStart: (card: CardItemType) => void;
}

const CardItem = ({ 
  card, 
  onDelete, 
  onSelect, 
  onEditStart
}: CardItemProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // 处理标签点击
  const handleTagClick = (e: React.MouseEvent, tag: CardItemType['tags'][0]) => {
    e.stopPropagation();
    console.log('Tag clicked:', tag);
  };

  const formattedDate = dayjs(card.createdAt).format('YYYY年MM月DD日 HH:mm:ss dddd');

  const handleDeleteConfirm = () => {
    onDelete(card.id);
    setIsDeleteDialogOpen(false);
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => onSelect(card)}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base sm:text-lg font-medium truncate max-w-[70%]">
          {card.title}
        </CardTitle>
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditStart(card);
            }}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            aria-label="编辑卡片"
          >
            <FiEdit2 className="w-4 h-4" />
          </button>
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogTrigger asChild>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDeleteDialogOpen(true);
                }}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                aria-label="删除卡片"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            </DialogTrigger>
            <DialogContent onClick={(e) => e.stopPropagation()}>
              <DialogHeader>
                <DialogTitle>确认删除</DialogTitle>
                <DialogDescription>
                  你确定要删除这张卡片吗？此操作无法撤销。
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={(e) => {
                  e.stopPropagation();
                  setIsDeleteDialogOpen(false)
                }}>
                  取消
                </Button>
                <Button variant="destructive" onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteConfirm()
                }}>
                  确认删除
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm sm:text-base text-gray-600 line-clamp-3">{card.content}</p>
        {/* 标签列表 */}
        <div className="flex flex-wrap gap-2 mt-3">
          {card.tags?.map((tag) => (
            <span
              key={tag.id}
              onClick={(e) => handleTagClick(e, tag)}
              className="px-2 py-1 text-xs rounded-full cursor-pointer hover:opacity-80 transition-opacity"
              style={{ backgroundColor: tag.color + '20', color: tag.color }}
            >
              {tag.name}
            </span>
          ))}
        </div>
        <p className="text-xs sm:text-sm text-gray-400 mt-2">{formattedDate}</p>
      </CardContent>
    </Card>
  );
};

export default CardItem; 