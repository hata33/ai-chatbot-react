import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CardItem, createCard, updateCard } from "@/api/card";
import { toast } from "sonner";
import { FiX } from "react-icons/fi";
// 引入通用持久化 hooks
import { usePersistentInput } from "@/hooks/usePersistentInput";

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
  // 标题和内容状态
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isEditing = !!initialData;

  // 生成唯一 key，支持多卡片编辑
  const titleKey = initialData
    ? `card_editor_title_${initialData.id}`
    : "card_editor_title";
  const contentKey = initialData
    ? `card_editor_content_${initialData.id}`
    : "card_editor_content";

  // 持久化 hooks，分别用于标题和内容，初始值为 initialData 或空字符串
  const {
    debouncedSave: debouncedSaveTitle,
    clearDraft: clearDraftTitle,
    restoreDraft: restoreTitleDraft,
  } = usePersistentInput({
    key: titleKey,
    initialValue: initialData?.title || "",
    setValue: setTitle,
  });
  const {
    debouncedSave: debouncedSaveContent,
    clearDraft: clearDraftContent,
    restoreDraft: restoreContentDraft,
  } = usePersistentInput({
    key: contentKey,
    initialValue: initialData?.content || "",
    setValue: setContent,
  });

  // 每次打开弹窗时都恢复草稿，并聚焦
  useEffect(() => {
    if (isOpen) {
      restoreTitleDraft();
      restoreContentDraft();
      setTimeout(() => {
        const titleInput = document.querySelector(
          'input[placeholder="请输入卡片标题"]'
        ) as HTMLInputElement;
        if (titleInput) {
          titleInput.focus();
        }
      }, 100);
    }
  }, [isOpen, restoreTitleDraft, restoreContentDraft]);

  // 处理保存
  const handleSave = async () => {
    try {
      if (isEditing && initialData) {
        const updatedCard = await updateCard(initialData.id, {
          title,
          content,
        });
        onSave(updatedCard);
        clearDraftTitle();
        clearDraftContent();
        toast.success("卡片更新成功");
      } else {
        const newCard = await createCard({
          title,
          content,
        });
        onSave(newCard);
        clearDraftTitle();
        clearDraftContent();
        toast.success("卡片创建成功");
      }
      onClose();
    } catch (error) {
      toast.error(isEditing ? "更新卡片失败" : "创建卡片失败");
      console.error(isEditing ? "更新卡片失败:" : "创建卡片失败:", error);
    }
  };

  // 处理关闭
  const handleClose = () => {
    onClose();
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      handleClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-none w-screen h-screen sm:w-[90vw] sm:h-[90vh] p-0 bg-white dark:bg-gray-900 flex flex-col">
        {/* 顶部工具栏 */}
        <div className="flex-none flex items-center justify-between p-4 border-b">
          <DialogTitle className="text-lg font-semibold">
            {isEditing ? "编辑卡片" : "新建卡片"}
          </DialogTitle>
          <button
            onClick={handleClose}
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
            onChange={(e) => {
              setTitle(e.target.value);
              debouncedSaveTitle(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            className="w-full text-lg font-medium flex-none"
            disabled={loading}
          />
          <div className="flex-1 min-h-0 relative">
            <Textarea
              ref={textareaRef}
              placeholder="请输入卡片内容"
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                debouncedSaveContent(e.target.value);
              }}
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
          <Button variant="outline" onClick={handleClose} disabled={loading}>
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
