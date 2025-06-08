// 用户类型定义
export interface User {
  id: string;
  email: string;
  createdAt: string;
}

// 问题类型定义
export interface Question {
  questionId: string;
  questionText: string;
  category: string | null;
  createTime: string;
  updateTime: string;
  isDeleted: number;
  userId: string;
}

// 回答类型定义
export interface Answer {
  answerId: string;
  questionId: string;
  userId: string;
  answerType: number;
  content: string;
  statusTags: string | null;
  createTime: string | null;
  updateTime: string | null;
  aiTemplateId: string | null;
  question: Question;
  user: User;
}

// 问题详情类型定义
export interface QuestionDetail {
  question: Question;
  answers: Answer[];
}

// 回答表单属性
export interface AnswerFormProps {
  onSubmit: (text: string, parentId?: string) => void;
  parentId?: string;
  isSubmitting: boolean;
}

// 回答项属性
export interface AnswerItemProps {
  answer: Answer;
  onReply: (parentId: string) => void;
  level?: number;
}

// 回答树属性
export interface AnswerTreeProps {
  answers: Answer[];
  onReply: (parentId: string) => void;
}

// 问题列表项属性
export interface QuestionItemProps {
  question: Question;
  onClick: (id: string) => void;
}

// 问题列表属性
export interface QuestionListProps {
  questions: Question[];
  onQuestionClick: (id: string) => void;
  onCreateNew: () => void;
}

// 反思问题类型定义
export interface ReflectionQuestion {
  questionId: string;              // 问题ID
  questionText: string;        // 问题内容
  frequency: 'daily' | 'weekly' | 'custom';
  createTime: string;       // 创建时间
  answers: Answer[];       // 回答列表
}

// 反思数据类型定义
export interface ReflectionData {
  questions: ReflectionQuestion[];
}

// 问题详情属性
export interface QuestionDetailProps {
  question: ReflectionQuestion;
  onAnswerSubmit: (text: string, parentId?: string) => void;
  onBack: () => void;
  isSubmitting: boolean;
  viewMode: 'list' | 'detail';
  onViewModeChange: (mode: 'list' | 'detail') => void;
} 