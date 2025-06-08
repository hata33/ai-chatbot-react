import { AnswerTreeProps, Answer } from "./types";
import { AnswerItem } from "./AnswerItem";

export const AnswerTree = ({ answers, onReply }: AnswerTreeProps) => {
  // 将扁平的回答数组转换为树形结构
  const buildAnswerTree = (answers: Answer[]) => {
    const answerMap = new Map();
    const rootAnswers: Answer[] = [];

    // 首先创建所有回答的映射
    answers.forEach((answer) => {
      answerMap.set(answer.answerId, { ...answer, children: [] });
    });

    // 构建树形结构
    answers.forEach((answer) => {
      const answerWithChildren = answerMap.get(answer.answerId);

      rootAnswers.push(answerWithChildren);
    });

    return rootAnswers;
  };

  const answerTree = buildAnswerTree(answers);

  return (
    <div className="space-y-4">
      {answerTree.map((answer) => (
        <AnswerItem key={answer.answerId} answer={answer} onReply={onReply} />
      ))}
    </div>
  );
};
