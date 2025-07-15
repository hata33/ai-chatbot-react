import { http } from '@/utils/request';

// 定义卡片类型
export interface CardItem {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  tags: {
    id: string;
    name: string;
    color: string;
    createdAt: string;
  }[];
}

// 创建卡片请求参数类型
export interface CreateCardRequest {
  title: string;
  content: string;
}

// 更新卡片请求参数类型
export interface UpdateCardRequest {
  title: string;
  content: string;
}

// API 响应类型
interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

// 获取所有卡片
export const getAllCards = async (): Promise<CardItem[]> => {
  const response = await http.get<ApiResponse<CardItem[]>>('/cards');
  return response.data;
};

// 创建卡片
export const createCard = async (data: CreateCardRequest): Promise<CardItem> => {
  const response = await http.post<ApiResponse<CardItem>>('/cards', data);
  return response.data;
};

// 更新卡片
export const updateCard = async (id: string, data: UpdateCardRequest): Promise<CardItem> => {
  const response = await http.put<ApiResponse<CardItem>>(`/cards/${id}`, data);
  return response.data;
};

// 删除卡片
export const deleteCard = async (id: string): Promise<void> => {
  await http.delete<ApiResponse<void>>(`/cards/${id}`);
};

// 上传卡片图片附件，返回图片url
export const uploadCardAttachment = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  // 中文注释：上传图片到 /cards/attachments，返回图片url
  const response = await http.post<ApiResponse<{ url: string }>>('/cards/attachments', formData);
  return response.data.url;
}; 