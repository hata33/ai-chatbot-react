import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { AnswerTree } from './AnswerTree';
import { QuestionDetailProps } from './types';

export const QuestionDetail = ({
  question,
  onAnswerSubmit,
  onBack,
  isSubmitting,
  viewMode,
  onViewModeChange
}: QuestionDetailProps) => {
  return (
    <div className="space-y-6">
      {/* 顶部操作栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-gray-500"
          >
            ← 返回
          </Button>
          <h2 className="text-2xl font-bold">{question.question}</h2>
        </div>
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

      {/* 回答表单 */}
      <Card className="p-6">
        <Textarea
          placeholder="想到什么就写什么，无需修饰..."
          className="h-[150px] mb-4"
        />
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">
            这是你第{question.answers.filter(a => !a.parentId).length + 1}次回答这个问题
          </p>
          <Button disabled={isSubmitting}>
            保存本次答案
          </Button>
        </div>
      </Card>

      {/* 历史记录 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">历史记录</h3>
        <AnswerTree
          answers={question.answers}
          onReply={(parentId) => onAnswerSubmit('', parentId)}
        />
      </Card>
    </div>
  );
}; 