import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AnswerItemProps } from './types';

export const AnswerItem = ({ answer, onReply, level = 0 }: AnswerItemProps) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');

  // 处理追答提交
  const handleReplySubmit = () => {
    if (!replyText.trim()) return;
    onReply(answer.answerId);
    setIsReplying(false);
    setReplyText('');
  };

  return (
    <div className={`ml-${level * 4} border-l-2 border-gray-200 pl-4 mb-4`}>
      {/* 回答内容 */}
      <div className="bg-gray-50 rounded-lg p-4 mb-2">
        <div className="flex justify-between items-start mb-2">
          <span className="text-sm text-gray-500">
            { answer.createTime }
          </span> 
        </div>  
        <p className="text-gray-700 whitespace-pre-wrap">{answer.content}</p>
      </div>

      {/* 追答按钮 */}
      {!isReplying && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsReplying(true)}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          追答
        </Button>
      )}

      {/* 追答表单 */}
      {isReplying && (
        <div className="mt-2">
          <Textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="写下你的追答..."
            className="mb-2"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleReplySubmit}>
              提交追答
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsReplying(false)}
            >
              取消
            </Button>
          </div>
        </div>
      )} 
    </div>
  );
}; 