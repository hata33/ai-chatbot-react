import { CardItem as CardItemType } from '@/api/card';
import CardItem from './CardItem';

interface CardListProps {
  cards: CardItemType[];
  onUpdate: (card: CardItemType) => void;
  onDelete: (id: string) => void;
  onSelect: (card: CardItemType) => void;
  editingCardId: string | null;
  onEditStart: (card: CardItemType) => void;
  onEditCancel: () => void;
}

const CardList = ({
  cards,
  onUpdate,
  onDelete,
  onSelect,
  editingCardId,
  onEditStart,
  onEditCancel
}: CardListProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card) => (
        <CardItem
          key={card.id}
          card={card}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onSelect={onSelect}
          isEditing={editingCardId === card.id}
          onEditStart={onEditStart}
          onEditCancel={onEditCancel}
        />
      ))}
    </div>
  );
};

export default CardList; 