import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { QuestionListProps, QuestionItemProps } from './types';

// 单个问题项组件
const QuestionItem = ({ question, onClick }: QuestionItemProps) => {
  const answerCount = question.answers.filter(a => !a.parentId).length;
  
  return (
    <Card 
      className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={() => onClick(question.questionId)}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium mb-2">{question.questionText}</h3>
          <p className="text-sm text-gray-500">
            创建于 { question.createTime }
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">
            {answerCount} 个回答
          </p>
          <p className="text-xs text-gray-400">
            {question.frequency === 'daily' ? '每日' : 
             question.frequency === 'weekly' ? '每周' : '自定义'}
          </p>
        </div>
      </div>
    </Card>
  );
};

// 问题列表组件
export const QuestionList = ({
  questions,
  onQuestionClick,
  onCreateNew,
  viewMode,
  onViewModeChange
}: QuestionListProps) => {
  return (
    <div className="space-y-4">
      {/* 顶部操作栏 */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">我的反思问题</h2>
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
            <Button
              variant="ghost"
              size="sm"
              className={viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-white/50'}
              onClick={() => onViewModeChange('list')}
            >
              列表视图
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={viewMode === 'detail' ? 'bg-white shadow-sm' : 'hover:bg-white/50'}
              onClick={() => onViewModeChange('detail')}
            >
              详情视图
            </Button>
          </div>
        </div>
        <Button onClick={onCreateNew}>
          新建问题
        </Button>
      </div>
      
      {questions?.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          还没有创建任何问题，点击"新建问题"开始吧
        </div>
      ) : (
        <div className="space-y-4">
          {questions?.map((question) => (
            <QuestionItem
              key={question.questionId}
              question={question}
              onClick={onQuestionClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}; 