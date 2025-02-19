import React, {useCallback, useRef, useEffect } from "react";
import { FiSend } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useDraftStorage } from "@/hooks/useDraftStorage";
import { useChat } from "@/hooks/useChat";
interface ChatInputProps {
  isFetching: boolean;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  chatId?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  isFetching,
  onSendMessage,
  onKeyPress,
  chatId,
}) => {
  const { input, setInput } = useChat();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { lastSavedTime, debouncedSave } = useDraftStorage({
    initialInput: input,
    setInput,
    chatId,
  });

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setInput(value);
      debouncedSave(value);
    },
    [setInput, debouncedSave]
  );

  return (
    <div className="max-w-4xl mx-auto flex flex-col space-y-2">
      <div className="flex space-x-4">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={handleInputChange}
          onKeyPress={onKeyPress}
          autoHeight={true}
          placeholder="输入消息..."
          className="flex-1 min-h-[44px] max-h-[200px] resize-none"
        />
        <Button
          onClick={onSendMessage}
          disabled={isFetching || !input.trim()}
          variant={isFetching || !input.trim() ? "secondary" : "default"}
          size="icon"
          className="shrink-0"
          aria-label="发送消息"
        >
          <FiSend className="w-5 h-5" />
        </Button>
      </div>
      {lastSavedTime && (
        <div className="text-xs text-muted-foreground text-right">
          自动保存于 {lastSavedTime}
        </div>
      )}
    </div>
  );
};

export default ChatInput;
