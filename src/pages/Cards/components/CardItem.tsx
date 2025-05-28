import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { CardItem as CardItemType } from '@/api/card';
import EditCardForm from './EditCardForm';

interface CardItemProps {
  card: CardItemType;
  onUpdate: (card: CardItemType) => void;
  onDelete: (id: string) => void;
  onSelect: (card: CardItemType) => void;
  isEditing: boolean;
  onEditStart: (card: CardItemType) => void;
  onEditCancel: () => void;
}

const CardItem = ({ 
  card, 
  onUpdate, 
  onDelete, 
  onSelect, 
  isEditing, 
  onEditStart, 
  onEditCancel 
}: CardItemProps) => {
  // 处理标签点击
  const handleTagClick = (e: React.MouseEvent, tag: CardItemType['tags'][0]) => {
    e.stopPropagation();
    console.log('Tag clicked:', tag);
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => !isEditing && onSelect(card)}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base sm:text-lg font-medium truncate max-w-[70%]">
          {isEditing ? (
            <EditCardForm
              card={card}
              onUpdate={onUpdate}
              onCancel={onEditCancel}
            />
          ) : (
            card.title
          )}
        </CardTitle>
        {!isEditing && (
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
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(card.id);
              }}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              aria-label="删除卡片"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {!isEditing && (
          <>
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
            <p className="text-xs sm:text-sm text-gray-400 mt-2">{card.createdAt}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default CardItem; 