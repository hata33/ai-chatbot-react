import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { NotificationService } from '@/services/notification';

// 定义类型
type Frequency = 'daily' | 'weekly' | 'custom';

interface Answer {
  date: string;
  text: string;
  keywords?: string[];
}

interface ReflectionData {
  question: string;
  frequency: Frequency;
  answers: Answer[];
}

// 本地存储键
const STORAGE_KEY = 'reflection_data';

export default function Reflection() {
  const [data, setData] = useState<ReflectionData | null>(null);
  const [question, setQuestion] = useState('');
  const [frequency, setFrequency] = useState<Frequency>('daily');
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  // 处理问题提交
  const handleQuestionSubmit = async () => {
    if (!question.trim()) {
      toast.error('请输入问题');
      return;
    }

    const newData: ReflectionData = {
      question: question.trim(),
      frequency,
      answers: [],
    };

    saveData(newData);
    toast.success('问题已设置');

    // 设置提醒
    await notificationService.scheduleReflectionReminder(newData.question, newData.frequency);
  };

  // 处理答案提交
  const handleAnswerSubmit = () => {
    if (!data) return;
    if (!answer.trim()) {
      toast.error('请输入答案');
      return;
    }

    // 检查提交间隔
    const lastAnswer = data.answers[data.answers.length - 1];
    if (lastAnswer) {
      const lastDate = new Date(lastAnswer.date);
      const now = new Date();
      const hoursDiff = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60);
      
      if (hoursDiff < 6) {
        toast.error('请至少等待6小时后再提交新的答案');
        return;
      }
    }

    setIsSubmitting(true);

    const newAnswer: Answer = {
      date: new Date().toISOString(),
      text: answer.trim(),
    };

    const newData: ReflectionData = {
      ...data,
      answers: [...data.answers, newAnswer],
    };

    saveData(newData);
    setAnswer('');
    setIsSubmitting(false);
    toast.success(`已保存第${newData.answers.length}次回答`);
  };

  // 获取情绪图标
  const getEmotionIcon = (text: string) => {
    const positiveWords = ['开心', '快乐', '幸福', '满意', '好'];
    const negativeWords = ['难过', '伤心', '痛苦', '失望', '不好'];
    
    if (positiveWords.some(word => text.includes(word))) return '😊';
    if (negativeWords.some(word => text.includes(word))) return '😞';
    return '😐';
  };

  // 渲染问题设置表单
  if (!data) {
    return (
      <div className="container mx-auto p-4 max-w-2xl">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-6">设置你的反思问题</h1>
          <div className="space-y-4">
            <Input
              placeholder="输入你想反复思考的问题，例如：我真正想要的是什么？"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <Select value={frequency} onValueChange={(value: Frequency) => setFrequency(value)}>
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
              开始探索
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // 渲染回答界面
  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">今日问题：{data.question}</h2>
        <Textarea
          placeholder="想到什么就写什么，无需修饰..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="h-[150px] mb-4"
        />
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">
            这是你第{data.answers.length + 1}次回答这个问题
          </p>
          <Button onClick={handleAnswerSubmit} disabled={isSubmitting}>
            保存本次答案
          </Button>
        </div>
      </Card>

      {/* 历史记录 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">历史记录</h3>
        <div className="space-y-4">
          {data.answers.slice(-3).reverse().map((item, index) => (
            <div key={item.date} className="border-b pb-4 last:border-b-0">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm text-gray-500">
                  {new Date(item.date).toLocaleDateString()}
                </span>
                <span className="text-lg">{getEmotionIcon(item.text)}</span>
              </div>
              <p className="text-gray-700">
                {item.text.length > 30 ? `${item.text.slice(0, 30)}...` : item.text}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
} 