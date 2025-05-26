import { useState, useEffect } from 'react';
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

// 本地存储键
const STORAGE_KEY = 'reflection_data';

// 视图类型
type ViewMode = 'list' | 'detail';

export default function Reflection() {
  const [data, setData] = useState<ReflectionData>({ questions: [] });
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'custom'>('daily');
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const notificationService = NotificationService.getInstance();

  // 加载数据
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      setData(JSON.parse(savedData));
    }
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

    const newQuestionData: ReflectionQuestion = {
      id: uuidv4(),
      question: newQuestion.trim(),
      frequency,
      createdAt: new Date().toISOString(),
      answers: [],
    };

    const newData: ReflectionData = {
      questions: [...(data?.questions||[]), newQuestionData],
    };

    saveData(newData);
    setNewQuestion('');
    setIsCreating(false);
    toast.success('问题已创建');

    // 设置提醒
    await notificationService.scheduleReflectionReminder(
      newQuestionData.question,
      newQuestionData.frequency
    );
  };

  // 处理答案提交
  const handleAnswerSubmit = (text: string, parentId?: string) => {
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

    const newAnswer = {
      id: uuidv4(),
      date: new Date().toISOString(),
      text: text.trim(),
      author: '我',
      parentId,
      children: [],
    };

    const updatedQuestion = {
      ...question,
      answers: [...question.answers, newAnswer],
    };

    const newData: ReflectionData = {
      questions: data.questions.map(q =>
        q.id === selectedQuestionId ? updatedQuestion : q
      ),
    };

    saveData(newData);
    setAnswer('');
    setIsSubmitting(false);
    toast.success('回答已保存');
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
      <div className="container mx-auto p-4 max-w-2xl">
        <Card className="p-6">
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
    <div className="container mx-auto p-4 max-w-2xl">
      <QuestionList
        questions={data.questions}
        onQuestionClick={(id) => {
          setSelectedQuestionId(id);
          setViewMode('detail');
        }}
        onCreateNew={() => setIsCreating(true)}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
      />
    </div>
  );
} 