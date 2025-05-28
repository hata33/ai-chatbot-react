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
  const isMobile = useRef(false);

  // 检测是否为移动设备
  useEffect(() => {
    const checkMobile = () => {
      isMobile.current = window.innerWidth < 768;
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 处理鼠标/触摸按下
  const handleStart = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    
    isDragging.current = true;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // 记录初始点击位置相对于卡片中心的位置
    lastPosition.current = {
      x: clientX - centerX,
      y: clientY - centerY
    };
  };

  // 处理鼠标/触摸移动
  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging.current || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // 计算当前位置相对于卡片中心的位置
    const currentX = clientX - centerX;
    const currentY = clientY - centerY;

    // 计算移动距离
    const deltaX = currentX - lastPosition.current.x;
    const deltaY = currentY - lastPosition.current.y;

    // 计算旋转角度（限制最大旋转角度）
    const maxRotation = isMobile.current ? 15 : 20;
    const newRotationX = Math.max(Math.min(deltaY / (isMobile.current ? 15 : 10), maxRotation), -maxRotation);
    const newRotationY = Math.max(Math.min(deltaX / (isMobile.current ? 15 : 10), maxRotation), -maxRotation);

    setRotation({ x: newRotationX, y: newRotationY });
  };

  // 处理鼠标移动
  const handleMouseMove = (e: MouseEvent) => {
    handleMove(e.clientX, e.clientY);
  };

  // 处理触摸移动
  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    }
  };

  // 处理鼠标/触摸释放
  const handleRelease = () => {
    isDragging.current = false;
    // 添加平滑过渡效果
    setRotation({ x: 0, y: 0 });
  };

  // 处理鼠标按下
  const handleMouseDown = (e: React.MouseEvent) => {
    // 如果点击的是关闭按钮，不启动拖动
    if ((e.target as HTMLElement).closest('button')) return;
    handleStart(e.clientX, e.clientY);
  };

  // 处理触摸开始
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      handleStart(touch.clientX, touch.clientY);
    }
  };

  // 添加和移除全局事件监听
  useEffect(() => {
    if (card) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleRelease);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleRelease);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleRelease);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleRelease);
    };
  }, [card]);

  if (!card) return null;

  return (
    <Dialog open={!!card} onOpenChange={onClose}>
      <DialogContent className=" p-0 bg-transparent border-none"> 
      <DialogTitle className="flex justify-end"></DialogTitle>
        <div 
          ref={containerRef}
          className="relative flex items-center justify-center"
          onMouseDown={(e) => {
            // 如果点击的是卡片内容区域，才启动拖动
            if ((e.target as HTMLElement).closest('.card-content')) {
              handleMouseDown(e);
            }
          }}
          onTouchStart={(e) => {
            // 如果触摸的是卡片内容区域，才启动拖动
            if ((e.target as HTMLElement).closest('.card-content')) {
              handleTouchStart(e);
            }
          }}
        >
          <div
            className="w-[50vh] max-w-[80vw] aspect-[1/1.586] card-content"
            style={{
              transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
              transition: isDragging.current ? 'none' : 'transform 0.3s ease-out',
            }}
          >
            <Card className="w-full h-full bg-white/95 backdrop-blur-sm shadow-2xl flex flex-col">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  {card.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto">
                <div className="prose prose-sm sm:prose-base max-w-none">
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {card.content}
                  </p>
                </div>
                {/* 标签列表 */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {card.tags?.map((tag) => (
                    <span
                      key={tag.id}
                      className="px-2 py-1 text-xs rounded-full"
                      style={{ backgroundColor: tag.color + '20', color: tag.color }}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </CardContent>
              <div className="px-6 py-3 border-t border-gray-100">
                <p className="text-xs sm:text-sm text-gray-500 flex items-center justify-end">
                  <span className="mr-2">创建时间：</span>
                  {card.createdAt}
                </p>
              </div>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Card3DModal; 