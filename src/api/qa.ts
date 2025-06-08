import { http } from '@/utils/request';
import { Answer as ReflectionAnswer, ReflectionQuestion } from '@/pages/Reflection/components/types';

// 问题类型定义
export type Question = ReflectionQuestion;

// 答案类型定义
export type Answer = ReflectionAnswer;

// API 响应类型
interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

// 创建问题的请求类型
export interface CreateQuestionRequest {
  questionText: string;
  frequency: 'daily' | 'weekly' | 'custom';
}

// 创建答案的请求类型
export interface CreateAnswerRequest {
  questionId: string;
  content: string;
  answerType: number;
}

// 问题相关API
export const questionApi = {
  // 获取问题列表
  getQuestions: async (): Promise<Question[]> => {
    const response = await http.get<ApiResponse<{data:Question[]}>>('/qa_question');
    return response.data.data;
  },

  // 创建问题
  createQuestion: async (data: CreateQuestionRequest): Promise<Question> => {
    const response = await http.post<ApiResponse<Question>>('/qa_question', data);
    return response.data;
  },

  // 更新问题
  updateQuestion: async (data: Partial<Question> & { id: string }): Promise<Question> => {
    const response = await http.put<ApiResponse<Question>>('/qa_question', data);
    return response.data;
  },

  // 删除问题
  deleteQuestion: async (id: string): Promise<void> => {
    await http.delete<ApiResponse<void>>(`/qa_question/${id}`);
  },

  // 获取单个问题
  getQuestion: async (id: string): Promise<Question> => {
    const response = await http.get<ApiResponse<Question>>(`/qa_question/${id}`);
    return response.data;
  }
};

// 答案相关API
export const answerApi = {
  // 获取答案列表
  getAnswers: async (): Promise<Answer[]> => {
    const response = await http.get<ApiResponse<Answer[]>>('/qa_answer');
    return response.data;
  },

  // 创建答案
  createAnswer: async (data: CreateAnswerRequest): Promise<Answer> => {
    const response = await http.post<ApiResponse<Answer>>('/qa_answer', data);
    return response.data;
  },

  // 删除答案
  deleteAnswer: async (id: string): Promise<void> => {
    await http.delete<ApiResponse<void>>(`/qa_answer/${id}`);
  },

  // 获取单个答案
  getAnswerDetail: async (id: string): Promise<Answer> => {
    const response = await http.post<ApiResponse<Answer>>('/qa_answer/detail', { id });
    return response.data;
  },

  // 获取问题的所有答案
  getQuestionAnswers: async (questionId: string): Promise<Answer[]> => {
    const response = await http.post<ApiResponse<Answer[]>>('/qa_answer/question-answers', { questionId });
    return response.data;
  },

  // 更新答案
  updateAnswer: async (data: Partial<Answer> & { id: string }): Promise<Answer> => {
    const response = await http.post<ApiResponse<Answer>>('/qa_answer/update', data);
    return response.data;
  }
};