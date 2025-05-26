// 回答类型定义
export interface Answer {
  id: string;              // 唯一标识
  date: string;            // 回答时间
  text: string;            // 回答内容
  author: string;          // 回答者
  parentId?: string;       // 父回答ID，用于构建对话树
  children: Answer[];      // 子回答
}

// 反思问题类型定义
export interface ReflectionQuestion {
  id: string;              // 问题ID
  question: string;        // 问题内容
  frequency: 'daily' | 'weekly' | 'custom';
  createdAt: string;       // 创建时间
  answers: Answer[];       // 回答列表
}

// 反思数据类型定义
export interface ReflectionData {
  questions: ReflectionQuestion[];
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
  question: ReflectionQuestion;
  onClick: (id: string) => void;
}

// 问题列表属性
export interface QuestionListProps {
  questions: ReflectionQuestion[];
  onQuestionClick: (id: string) => void;
  onCreateNew: () => void;
  viewMode: 'list' | 'detail';
  onViewModeChange: (mode: 'list' | 'detail') => void;
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