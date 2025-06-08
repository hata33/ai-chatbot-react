import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Question, Answer } from './components/types';
import { questionApi, answerApi } from '@/api/qa';

export default function QuestionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnswerVisible, setIsAnswerVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 加载问题详情和回答
  const loadData = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      // 获取问题详情
      const questionData = await questionApi.getQuestion(id);
      setQuestion(questionData);

      // 获取回答列表
      const answersData = await answerApi.getQuestionAnswers(id);
      setAnswers(answersData);
    } catch (error) {
      toast.error('加载数据失败');
      console.error('加载数据失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  // 处理答案提交
  const handleAnswerSubmit = async () => {
    if (!id || !answer.trim()) {
      toast.error('请输入答案');
      return;
    }

    setIsSubmitting(true);

    try {
      await answerApi.createAnswer({
        questionId: id,
        content: answer.trim(),
        answerType: 0,
      });

      setAnswer('');
      setIsAnswerVisible(false);
      toast.success('回答已保存');
      // 重新加载数据
      await loadData();
    } catch (error) {
      toast.error('保存回答失败');
      console.error('保存回答失败:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen">
        <div className="flex-none">
          <Card className="m-4 p-6">
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="ghost"
                onClick={() => navigate('/reflection')}
                className="text-gray-500"
              >
                ← 返回
              </Button>
              <h1 className="text-2xl font-bold">问题详情</h1>
            </div>
            <div className="text-center py-8">加载中...</div>
          </Card>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="flex flex-col h-screen">
        <div className="flex-none">
          <Card className="m-4 p-6">
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="ghost"
                onClick={() => navigate('/reflection')}
                className="text-gray-500"
              >
                ← 返回
              </Button>
              <h1 className="text-2xl font-bold">问题详情</h1>
            </div>
            <div className="text-center py-8 text-red-500">问题不存在或已被删除</div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* 顶部问题卡片 */}
      <div className="flex-none">
        <Card className="m-4 p-6">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/reflection')}
              className="text-gray-500"
            >
              ← 返回
            </Button>
            <h1 className="text-2xl font-bold">问题详情</h1>
          </div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">{question.questionText}</h2>
            <div className="text-sm text-gray-500">
              创建于 {new Date(question.createTime).toLocaleString()}
            </div>
          </div>
        </Card>
      </div>

      {/* 中间回答列表区域 - 可滚动 */}
      <div className="flex-1 overflow-y-auto px-4">
        <div className="space-y-4 pb-4">
          {answers.length === 0 ? (
            <Card className="p-8 text-center text-gray-500">
              暂无回答，快来发表你的想法吧！
            </Card>
          ) : (
            answers.map((answer) => (
              <Card key={answer.answerId} className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="text-sm text-gray-500 mb-2">
                      {answer.updateTime ? new Date(answer.updateTime).toLocaleString() : '刚刚'}
                    </div>
                    <div className="text-gray-800 whitespace-pre-wrap">{answer.content}</div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* 底部回答输入区域 */}
      <div className="flex-none border-t bg-white">
        {isAnswerVisible ? (
          <Card className="m-4 p-4">
            <div className="space-y-4">
              <Textarea
                placeholder="写下你的想法..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="min-h-[100px]"
              />
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={() => setIsAnswerVisible(false)}
                  className="flex-1"
                >
                  取消
                </Button>
                <Button 
                  onClick={handleAnswerSubmit} 
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? '提交中...' : '提交回答'}
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <div className="p-4">
            <Button 
              onClick={() => setIsAnswerVisible(true)}
              className="w-full"
            >
              添加回答
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 