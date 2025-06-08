import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { NotificationService } from '@/services/notification';
import { AnswerTree } from './components/AnswerTree';
import { Answer, ReflectionData, ReflectionQuestion } from './components/types';
import { v4 as uuidv4 } from 'uuid';
import { QuestionList } from './components/QuestionList';
import { QuestionDetail } from './components/QuestionDetail';
import { questionApi, answerApi } from '@/api/qa';
import { Home, Plus, Search, Filter } from 'lucide-react';

// 本地存储键
const STORAGE_KEY = 'reflection_data';

// 视图类型
type ViewMode = 'list' | 'detail';

export default function Reflection() {
  const navigate = useNavigate();
  const [data, setData] = useState<ReflectionData>({ questions: [] });
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'custom'>('daily');
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const notificationService = NotificationService.getInstance();

  // 加载数据
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const questions = await questionApi.getQuestions();
        // 确保每个问题都有answers数组
        const questionsWithAnswers = questions.map(q => ({
          ...q,
          answers: q.answers || []
        }));
        setData({ questions: questionsWithAnswers });
      } catch (error) {
        toast.error('加载问题列表失败');
        console.error('加载问题列表失败:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // 请求通知权限
  useEffect(() => {
    notificationService.requestPermission();
  }, []);

  // 保存数据
  const saveData = (newData: ReflectionData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    setData(newData);
  };

  // 处理问题创建
  const handleQuestionSubmit = async () => {
    if (!newQuestion.trim()) {
      toast.error('请输入问题');
      return;
    }

    try {
      const newQuestionData = await questionApi.createQuestion({
        question: newQuestion.trim(),
        frequency,
      });

      // 确保新问题有answers数组
      const questionWithAnswers = {
        ...newQuestionData,
        answers: []
      };

      setData(prev => ({
        questions: [...prev.questions, questionWithAnswers],
      }));

      setNewQuestion('');
      setIsCreating(false);
      toast.success('问题已创建');

      // 设置提醒
      await notificationService.scheduleReflectionReminder(
        newQuestionData.questionText,
        newQuestionData.frequency
      );
    } catch (error) {
      toast.error('创建问题失败');
      console.error('创建问题失败:', error);
    }
  };
 

  // 处理答案提交
  const handleAnswerSubmit = async (text: string, parentId?: string) => {
    if (!selectedQuestionId) return;
    if (!text.trim()) {
      toast.error('请输入答案');
      return;
    }

    const question = data.questions.find(q => q.id === selectedQuestionId);
    if (!question) return;

    // 检查提交间隔（仅对根回答进行检查）
    if (!parentId) {
      const lastAnswer = question.answers.find(a => !a.parentId);
      if (lastAnswer) {
        const lastDate = new Date(lastAnswer.date);
        const now = new Date();
        const hoursDiff = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60);
        
        if (hoursDiff < 6) {
          toast.error('请至少等待6小时后再提交新的答案');
          return;
        }
      }
    }

    setIsSubmitting(true);

    try {
      const newAnswer = await answerApi.createAnswer({
        text: text.trim(),
        author: '我',
        parentId,
      });

      // 确保新答案有children数组
      const answerWithChildren = {
        ...newAnswer,
        children: []
      };

      const updatedQuestion = {
        ...question,
        answers: [...question.answers, answerWithChildren],
      };

      setData(prev => ({
        questions: prev.questions.map(q =>
          q.id === selectedQuestionId ? updatedQuestion : q
        ),
      }));

      setAnswer('');
      toast.success('回答已保存');
    } catch (error) {
      toast.error('保存回答失败');
      console.error('保存回答失败:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 获取情绪图标
  const getEmotionIcon = (text: string) => {
    const positiveWords = ['开心', '快乐', '幸福', '满意', '好'];
    const negativeWords = ['难过', '伤心', '痛苦', '失望', '不好'];
    
    if (positiveWords.some(word => text.includes(word))) return '😊';
    if (negativeWords.some(word => text.includes(word))) return '😞';
    return '😐';
  };

  // 处理视图切换
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    if (mode === 'list') {
      setSelectedQuestionId(null);
    }
  };

  // 渲染创建问题表单
  if (isCreating) {
    return (
      <div className="flex flex-col h-screen">
        <div className="flex-none">
          <Card className="m-4 p-6">
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="ghost"
                onClick={() => setIsCreating(false)}
                className="text-gray-500"
              >
                ← 返回
              </Button>
              <h1 className="text-2xl font-bold">创建新问题</h1>
            </div>
            <div className="space-y-4">
              <Input
                placeholder="输入你想反复思考的问题，例如：我真正想要的是什么？"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
              />
              <Select value={frequency} onValueChange={(value: 'daily' | 'weekly' | 'custom') => setFrequency(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="选择提醒频率" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">每日</SelectItem>
                  <SelectItem value="weekly">每周</SelectItem>
                  <SelectItem value="custom">自定义</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleQuestionSubmit} className="w-full">
                创建问题
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // 渲染问题详情
  if (viewMode === 'detail' && selectedQuestionId) {
    const question = data.questions.find(q => q.id === selectedQuestionId);
    if (!question) return null;

    return (
      <div className="container mx-auto p-4 max-w-2xl">
        <QuestionDetail
          question={question}
          onAnswerSubmit={handleAnswerSubmit}
          onBack={() => handleViewModeChange('list')}
          isSubmitting={isSubmitting}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
        />
      </div>
    );
  }

  // 渲染问题列表
  return (
    <div className="flex flex-col h-screen">
      {/* 顶部导航栏 */}
      <div className="flex-none border-b bg-white">
        <div className="container mx-auto p-4 max-w-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link to="/">
                <Button variant="ghost" size="icon">
                  <Home className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="text-xl font-bold">反思问题</h1>
            </div>
            <Button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              新建问题
            </Button>
          </div>
        </div>
      </div>

      {/* 搜索和过滤区域 */}
      <div className="flex-none border-b bg-white">
        <div className="container mx-auto p-4 max-w-2xl">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="搜索问题..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 问题列表区域 - 可滚动 */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-4 max-w-2xl">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">加载中...</div>
          ) :  data.questions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">
                {searchQuery ? '没有找到匹配的问题' : '还没有创建任何问题'}
              </p>
              {!searchQuery && (
                <Button onClick={() => setIsCreating(true)}>
                  创建第一个问题
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              { data.questions.map((question) => (
                <Card
                  key={question.questionId}
                  className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/reflection/question/${question.questionId}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{question.questionText}</h3>
                      <div className="text-sm text-gray-500">
                        创建于 {new Date(question.createTime).toLocaleString()}
                      </div>
                      {question.answers && question.answers.length > 0 && (
                        <div className="text-sm text-gray-500 mt-2">
                          已有 {question.answers.length} 个回答
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 