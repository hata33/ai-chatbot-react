import { useState, useCallback, useEffect } from 'react';
import { debounce } from 'lodash';

// 存储键名常量
const STORAGE_KEYS = {
  DRAFT: "chat_draft",
  TIMESTAMP: "chat_draft_timestamp",
  STORAGE_TYPE: "chat_storage_type",
} as const;

// 存储类型
const StorageType = {
  LOCAL: "localStorage",
  SESSION: "sessionStorage",
} as const;

type StorageType = typeof StorageType[keyof typeof StorageType];

interface UseDraftStorageProps {
  initialInput: string;
  setInput: (value: string) => void;
  chatId?: string;
}

export const useDraftStorage = ({ initialInput, setInput, chatId }: UseDraftStorageProps) => {
  const [lastSavedTime, setLastSavedTime] = useState<string>("");
  const [storageType, setStorageType] = useState<StorageType>(StorageType.LOCAL);

  const getCurrentStorage = useCallback(() => {
    try {
      return window[storageType];
    } catch (e) {
      return window.sessionStorage;
    }
  }, [storageType]);

  const getDraftKey = useCallback(() => {
    return chatId ? `${STORAGE_KEYS.DRAFT}_${chatId}` : STORAGE_KEYS.DRAFT;
  }, [chatId]);

  const getTimestampKey = useCallback(() => {
    return chatId ? `${STORAGE_KEYS.TIMESTAMP}_${chatId}` : STORAGE_KEYS.TIMESTAMP;
  }, [chatId]);

  const saveDraft = useCallback(
    (value: string) => {
      try {
        const storage = getCurrentStorage();
        storage.setItem(getDraftKey(), value);
        const timestamp = new Date().toLocaleTimeString();
        storage.setItem(getTimestampKey(), timestamp);
        setLastSavedTime(timestamp);
      } catch (e) {
        if (storageType === StorageType.LOCAL) {
          setStorageType(StorageType.SESSION);
          getCurrentStorage().setItem(STORAGE_KEYS.STORAGE_TYPE, StorageType.SESSION);
        }
      }
    },
    [getCurrentStorage, storageType, getDraftKey, getTimestampKey]
  );

  const clearDraft = useCallback(() => {
    try {
      const storage = getCurrentStorage();
      storage.removeItem(getDraftKey());
      storage.removeItem(getTimestampKey());
      setLastSavedTime("");
    } catch (e) {
      console.warn("Failed to clear draft:", e);
    }
  }, [getCurrentStorage, getDraftKey, getTimestampKey]);

  // 使用 useCallback 包装 debounce 函数
  const debouncedSave = useCallback(
    debounce((value: string) => saveDraft(value), 3000),
    [saveDraft]
  );

  useEffect(() => {
    try {
      const savedStorageType = localStorage.getItem(STORAGE_KEYS.STORAGE_TYPE) as StorageType;
      if (savedStorageType) {
        setStorageType(savedStorageType);
      }

      const storage = getCurrentStorage();
      const savedDraft = storage.getItem(getDraftKey());
      const savedTimestamp = storage.getItem(getTimestampKey());

      if (savedDraft) {
        setInput(savedDraft);
      }
      if (savedTimestamp) {
        setLastSavedTime(savedTimestamp);
      }
    } catch (e) {
      console.warn("Failed to restore draft:", e);
    }
  }, [getCurrentStorage, setInput, getDraftKey, getTimestampKey]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === getDraftKey() && e.newValue !== initialInput) {
        setInput(e.newValue || "");
      }
      if (e.key === getTimestampKey()) {
        setLastSavedTime(e.newValue || "");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [initialInput, setInput, getDraftKey, getTimestampKey]);

  return {
    lastSavedTime,
    debouncedSave,
    clearDraft,
  };
}; 