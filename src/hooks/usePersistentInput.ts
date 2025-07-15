import { useState, useCallback, useEffect } from "react";
import { debounce } from "lodash";

// 存储类型常量
const StorageType = {
  LOCAL: "localStorage",
  SESSION: "sessionStorage",
} as const;

type StorageType = typeof StorageType[keyof typeof StorageType];

interface UsePersistentInputProps {
  key: string; // 唯一存储 key
  initialValue: string; // 默认初始值（仅在无存储值时使用）
  setValue: (value: string) => void; // 设置输入框内容的方法
  storageType?: StorageType; // 存储类型，默认 localStorage
  debounceMs?: number; // 防抖时间，默认 3000ms
}

// 通用输入框持久化存储 hooks
export const usePersistentInput = ({
  key,
  initialValue,
  setValue,
  storageType = StorageType.LOCAL,
  debounceMs = 3000,
}: UsePersistentInputProps) => {
  // 最后保存时间
  const [lastSavedTime, setLastSavedTime] = useState<string>("");
  // 当前存储类型
  const [currentStorageType, setCurrentStorageType] = useState<StorageType>(storageType);

  // 获取当前存储对象
  const getCurrentStorage = useCallback(() => {
    try {
      return window[currentStorageType];
    } catch {
      return window.sessionStorage;
    }
  }, [currentStorageType]);

  // 生成存储内容和时间戳的 key
  const getDraftKey = useCallback(() => `${key}_draft`, [key]);
  const getTimestampKey = useCallback(() => `${key}_draft_timestamp`, [key]);

  // 保存草稿
  const saveDraft = useCallback(
    (value: string) => {
      try {
        const storage = getCurrentStorage();
        storage.setItem(getDraftKey(), value);
        const timestamp = new Date().toLocaleTimeString();
        storage.setItem(getTimestampKey(), timestamp);
        setLastSavedTime(timestamp);
      } catch {
        // 如果 localStorage 失败，自动切换到 sessionStorage
        if (currentStorageType === StorageType.LOCAL) {
          setCurrentStorageType(StorageType.SESSION);
        }
      }
    },
    [getCurrentStorage, currentStorageType, getDraftKey, getTimestampKey]
  );

  // 清除草稿
  const clearDraft = useCallback(() => {
    try {
      const storage = getCurrentStorage();
      storage.removeItem(getDraftKey());
      storage.removeItem(getTimestampKey());
      setLastSavedTime("");
    } catch (e) {
      console.warn("清除草稿失败:", e);
    }
  }, [getCurrentStorage, getDraftKey, getTimestampKey]);

  const debouncedSave = useCallback(
    debounce((value: string) => saveDraft(value), debounceMs),
    [saveDraft, debounceMs]
  );

  // 主动恢复草稿的方法，供外部调用
  const restoreDraft = useCallback(() => {
    try {
      const storage = window[storageType];
      const savedDraft = storage.getItem(`${key}_draft`);
      const savedTimestamp = storage.getItem(`${key}_draft_timestamp`);
      if (savedDraft !== null) {
        setValue(savedDraft);
      } else {
        setValue(initialValue);
      }
      if (savedTimestamp) {
        setLastSavedTime(savedTimestamp);
      }
    } catch {
      setValue(initialValue);
    }
  }, [key, initialValue, setValue, storageType]);

  // 初始化恢复草稿（首次挂载）
  useEffect(() => {
    restoreDraft();
    // 只依赖 key 和 initialValue
  }, [key, initialValue, setValue, storageType, restoreDraft]);

  // 监听 storage 事件，实现多标签页同步
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === getDraftKey()) {
        setValue(e.newValue || initialValue);
      }
      if (e.key === getTimestampKey()) {
        setLastSavedTime(e.newValue || "");
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [initialValue, setValue, getDraftKey, getTimestampKey]);

  return {
    lastSavedTime, // 最后保存时间
    debouncedSave, // 防抖保存方法
    clearDraft,    // 清除草稿方法
    restoreDraft,  // 主动恢复草稿方法
  };
};