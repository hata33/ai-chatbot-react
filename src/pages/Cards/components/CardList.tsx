import { CardItem as CardItemType } from '@/api/card';
import CardItem from './CardItem';

interface CardListProps {
  cards: CardItemType[];
  onDelete: (id: string) => void;
  onSelect: (card: CardItemType) => void;
  onEditStart: (card: CardItemType) => void;
}

const CardList = ({
  cards,
  onDelete,
  onSelect,
  onEditStart
}: CardListProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card) => (
        <CardItem
          key={card.id}
          card={card}
          onDelete={onDelete}
          onSelect={onSelect}
          onEditStart={onEditStart}
        />
      ))}
    </div>
  );
};

export default CardList; 