import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { CardItem } from '@/api/card';
import { FiX } from 'react-icons/fi';

interface Card3DModalProps {
  card: CardItem | null;
  onClose: () => void;
}

const Card3DModal = ({ card, onClose }: Card3DModalProps) => {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const lastPosition = useRef({ x: 0, y: 0 });

  // 处理鼠标移动
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // 计算鼠标位置相对于容器中心的位置
    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;

    // 计算旋转角度（限制最大旋转角度）
    const maxRotation = 20;
    const newRotationX = Math.max(Math.min(deltaY / 10, maxRotation), -maxRotation);
    const newRotationY = Math.max(Math.min(deltaX / 10, maxRotation), -maxRotation);

    setRotation({ x: newRotationX, y: newRotationY });
  };

  // 处理鼠标释放
  const handleMouseUp = () => {
    isDragging.current = false;
    // 添加平滑过渡效果
    setRotation({ x: 0, y: 0 });
  };

  // 处理鼠标按下
  const handleMouseDown = (e: React.MouseEvent) => {
    // 如果点击的是关闭按钮，不启动拖动
    if ((e.target as HTMLElement).closest('button')) return;
    
    isDragging.current = true;
    lastPosition.current = { x: e.clientX, y: e.clientY };
  };

  // 添加和移除全局事件监听
  useEffect(() => {
    if (card) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [card]);

  if (!card) return null;

  return (
    <Dialog open={!!card} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] p-0 bg-transparent border-none">
        <DialogTitle className="sr-only">卡片详情</DialogTitle>
        <div 
          ref={containerRef}
          className="relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="关闭"
          >
            <FiX className="w-6 h-6 text-white" />
          </button>
          <div
            className="w-full max-w-2xl"
            style={{
              transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
              transition: isDragging.current ? 'none' : 'transform 0.3s ease-out',
            }}
          >
            <Card className="w-full h-full bg-white/95 backdrop-blur-sm shadow-2xl">
              <CardHeader>
                <CardTitle className="text-2xl">{card.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-lg whitespace-pre-wrap">{card.content}</p>
                <p className="text-sm text-gray-400 mt-4">{card.createdAt}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Card3DModal; 