import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CardItem, createCard, updateCard } from "@/api/card";
import { toast } from "sonner";
import { FiX } from "react-icons/fi";

interface CardEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (card: CardItem) => void;
  initialData?: CardItem | null;
  loading?: boolean;
}

const CardEditor = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  loading = false,
}: CardEditorProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isEditing = !!initialData;

  // 当编辑器打开时，设置初始值
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title);
        setContent(initialData.content);
      } else {
        setTitle("");
        setContent("");
      }
      // 聚焦到标题输入框
      setTimeout(() => {
        const titleInput = document.querySelector(
          'input[placeholder="请输入卡片标题"]'
        ) as HTMLInputElement;
        if (titleInput) {
          titleInput.focus();
        }
      }, 100);
    }
  }, [isOpen, initialData]);

  // 处理保存
  const handleSave = async () => {
    // if (!title.trim() || !content.trim()) {
    //   toast.error("标题和内容不能为空");
    //   return;
    // }

    try {
      if (isEditing && initialData) {
        const updatedCard = await updateCard(initialData.id, {
          title,
          content,
        });
        onSave(updatedCard);
        toast.success("卡片更新成功");
      } else {
        const newCard = await createCard({
          title,
          content,
        });
        onSave(newCard);
        toast.success("卡片创建成功");
      }
      onClose();
    } catch (error) {
      toast.error(isEditing ? "更新卡片失败" : "创建卡片失败");
      console.error(isEditing ? "更新卡片失败:" : "创建卡片失败:", error);
    }
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl/Cmd + Enter 保存
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSave();
    }
    // Esc 关闭
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-none w-screen h-screen sm:w-[90vw] sm:h-[90vh] p-0 bg-white dark:bg-gray-900 flex flex-col">
        {/* 顶部工具栏 */}
        <div className="flex-none flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">
            {isEditing ? "编辑卡片" : "新建卡片"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
            aria-label="关闭"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* 编辑区域 */}
        <div className="flex-1 flex flex-col p-4 gap-4 min-h-0">
          <Input
            placeholder="请输入卡片标题"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full text-lg font-medium flex-none"
            disabled={loading}
          />
          <div className="flex-1 min-h-0 relative">
            <Textarea
              ref={textareaRef}
              placeholder="请输入卡片内容"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full h-full absolute inset-0 text-base resize-none"
              style={{
                minHeight: "100%",
                maxHeight: "none",
              }}
              disabled={loading}
            />
          </div>
        </div>

        {/* 底部工具栏 */}
        <div className="flex-none p-4 border-t flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            取消
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "保存中..." : "保存"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CardEditor;
