import * as React from "react"

import { cn } from "@/lib/utils"

interface TextareaProps extends React.ComponentProps<"textarea"> {
  autoHeight?: boolean;
  minHeight?: number;
  maxHeight?: number;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, autoHeight = false, minHeight = 60, maxHeight = 200, style, ...props }, ref) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    // 合并外部传入的 ref 和内部 ref
    const combinedRef = React.useCallback(
      (element: HTMLTextAreaElement | null) => {
        if (typeof ref === "function") {
          ref(element);
        } else if (ref) {
          ref.current = element;
        }
        textareaRef.current = element;
      },
      [ref]
    );

    // 调整高度函数
    const adjustHeight = React.useCallback(() => {
      const textarea = textareaRef.current;
      if (textarea && autoHeight) {
        // 重置高度以获取正确的 scrollHeight
        textarea.style.height = "auto";
        // 设置新的高度，不超过最大高度
        const newHeight = Math.min(textarea.scrollHeight, maxHeight);
        textarea.style.height = `${newHeight}px`;
      }
    }, [autoHeight, maxHeight]);

    // 监听输入内容变化
    React.useEffect(() => {
      if (autoHeight) {
        adjustHeight();
      }
    }, [props.value, autoHeight, adjustHeight]);

    // 合并样式
    const mergedStyle = React.useMemo(() => {
      const baseStyle = {
        minHeight: autoHeight ? `${minHeight}px` : undefined,
        ...(autoHeight && { height: textareaRef.current?.style.height }),
      };

      return {
        ...baseStyle,
        ...style
      };
    }, [autoHeight, minHeight, style]);

    return (
      <textarea
        className={cn(
          "flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          autoHeight && "resize-none",
          className
        )}
        style={mergedStyle}
        ref={combinedRef}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
