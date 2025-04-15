import React, { useEffect, useState, useCallback, useRef } from "react";
import { FiSend } from "react-icons/fi";
import { debounce } from "lodash";

// 存储键名常量
const STORAGE_KEYS = {
  DRAFT: "chat_draft",
  TIMESTAMP: "chat_draft_timestamp",
  STORAGE_TYPE: "chat_storage_type",
} as const;

// 存储类型枚举
enum StorageType {
  LOCAL = "localStorage",
  SESSION = "sessionStorage",
}

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  isFetching: boolean;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  isFetching,
  onSendMessage,
  onKeyPress,
}) => {
  const [lastSavedTime, setLastSavedTime] = useState<string>("");
  const [storageType, setStorageType] = useState<StorageType>(
    StorageType.LOCAL
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 获取当前存储类型
  const getCurrentStorage = useCallback(() => {
    try {
      return window[storageType];
    } catch (e) {
      return window.sessionStorage;
    }
  }, [storageType]);

  // 保存草稿到存储
  const saveDraft = useCallback(
    (value: string) => {
      try {
        const storage = getCurrentStorage();
        storage.setItem(STORAGE_KEYS.DRAFT, value);
        const timestamp = new Date().toLocaleTimeString();
        storage.setItem(STORAGE_KEYS.TIMESTAMP, timestamp);
        setLastSavedTime(timestamp);
      } catch (e) {
        // 如果 localStorage 已满，降级到 sessionStorage
        if (storageType === StorageType.LOCAL) {
          setStorageType(StorageType.SESSION);
          getCurrentStorage().setItem(
            STORAGE_KEYS.STORAGE_TYPE,
            StorageType.SESSION
          );
        }
      }
    },
    [getCurrentStorage, storageType]
  );

  // 防抖保存函数
  const debouncedSave = useCallback(
    debounce((value: string) => {
      saveDraft(value);
    }, 1000),
    [saveDraft]
  );

  // 调整输入框高度
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // 重置高度以获取正确的 scrollHeight
      textarea.style.height = "auto";
      // 设置新的高度，最大不超过 200px
      const newHeight = Math.min(textarea.scrollHeight, 200);
      textarea.style.height = `${newHeight}px`;
    }
  }, []);

  // 监听输入内容变化并调整高度
  useEffect(() => {
    adjustTextareaHeight();
  }, [input, adjustTextareaHeight]);

  // 初始化时恢复草稿
  useEffect(() => {
    try {
      // 检查存储类型
      const savedStorageType = localStorage.getItem(
        STORAGE_KEYS.STORAGE_TYPE
      ) as StorageType;
      if (savedStorageType) {
        setStorageType(savedStorageType);
      }

      const storage = getCurrentStorage();
      const savedDraft = storage.getItem(STORAGE_KEYS.DRAFT);
      const savedTimestamp = storage.getItem(STORAGE_KEYS.TIMESTAMP);

      if (savedDraft) {
        setInput(savedDraft);
      }
      if (savedTimestamp) {
        setLastSavedTime(savedTimestamp);
      }
    } catch (e) {
      console.warn("Failed to restore draft:", e);
    }
  }, [getCurrentStorage, setInput]);

  // 监听其他标签页的存储变化
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.DRAFT && e.newValue !== input) {
        setInput(e.newValue || "");
      }
      if (e.key === STORAGE_KEYS.TIMESTAMP) {
        setLastSavedTime(e.newValue || "");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [input]);

  // 处理输入变化
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setInput(value);
      debouncedSave(value);
    },
    [setInput, debouncedSave]
  );

  // 处理移动端键盘事件
  useEffect(() => {
    const handleResize = () => {
      // 确保输入框在键盘弹出/收起时保持可见
      const activeElement = document.activeElement as HTMLElement;
      if (activeElement?.tagName === "TEXTAREA") {
        activeElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="max-w-4xl mx-auto flex flex-col space-y-2">
      <div className="flex space-x-4">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInputChange}
          onKeyPress={onKeyPress}
          placeholder="输入消息..."
          className="flex-1 p-3 border border-gray-200 dark:border-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
          style={{ minHeight: "44px", maxHeight: "200px" }}
          aria-label="消息输入框"
        />
        <button
          onClick={onSendMessage}
          disabled={isFetching || !input.trim()}
          className={`p-3 rounded-lg shrink-0 ${
            isFetching || !input.trim()
              ? "bg-gray-300 dark:bg-gray-600 cursor-not-allowed"
              : "bg-primary-500 text-white hover:bg-primary-600"
          }`}
          aria-label="发送消息"
        >
          <FiSend className="w-6 h-6" />
        </button>
      </div>
      {lastSavedTime && (
        <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
          自动保存于 {lastSavedTime}
        </div>
      )}
    </div>
  );
};

export default ChatInput;
