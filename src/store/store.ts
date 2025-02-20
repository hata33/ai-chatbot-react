import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 定义状态类型
interface StoreState {
  user: any; // 可以根据需要定义更具体的类型
  token: string | null;
  setUser: (user: any) => void;
  setToken: (token: string) => void;
  logout: () => void;
  currentModel: string;
  setCurrentModel: (model: string) => void;
}

// 创建 Zustand 状态管理器
export const useStore = create(
  persist<StoreState>(
    (set) => ({
      user: null,
      token: null,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      logout: () => set({ user: null, token: null }),
      currentModel: 'gpt-3.5-turbo',
      setCurrentModel: (model) => set({ currentModel: model }),
    }),
    {
      name: 'auth-storage', // 存储的名称
    }
  )
); 