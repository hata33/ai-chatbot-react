import ReactMarkdown from 'react-markdown';
import { Highlight, themes } from 'prism-react-renderer';

// 代码块属性类型
interface CodeProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

// Markdown渲染器属性类型
interface MarkdownRendererProps {
  content: string;
  isDark?: boolean;
}

// Markdown渲染组件
const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, isDark = false }) => {
  // 代码块渲染组件
  const CodeBlock = ({ node, inline, className, children, ...props }: CodeProps) => {
    const match = /language-(\w+)/.exec(className || '');
    
    // 如果是内联代码
    if (inline) {
      return (
        <code 
          className={`${className} px-1 rounded font-mono text-sm
            ${isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800'}`} 
          {...props}
        >
          {children}
        </code>
      );
    }

    // 如果是代码块
    if (!inline && match) {
      return (
        <div className="relative group">
          {/* 代码语言标签 */}
          <div className="absolute right-2 top-2 px-2 py-1 text-xs rounded bg-gray-700/50 text-gray-300">
            {match[1]}
          </div>
          
          <Highlight
            code={String(children).replace(/\n$/, '')}
            language={match[1]}
            theme={isDark ? themes.nightOwl : themes.github}
          >
            {({ className, style, tokens, getLineProps, getTokenProps }) => (
              <pre 
                className={`${className} p-4 rounded-md overflow-auto relative
                  ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`} 
                style={style}
              >
                {/* 行号 */}
                <div className="absolute left-0 top-4 bottom-4 flex flex-col text-xs text-gray-400 bg-inherit">
                  {tokens.map((_, i) => (
                    <div key={i} className="px-2 text-right select-none">
                      {i + 1}
                    </div>
                  ))}
                </div>
                
                {/* 代码内容 */}
                <div className="pl-8">
                  {tokens.map((line, i) => (
                    <div key={i} {...getLineProps({ line })}>
                      {line.map((token, key) => (
                        <span key={key} {...getTokenProps({ token })} />
                      ))}
                    </div>
                  ))}
                </div>
              </pre>
            )}
          </Highlight>
        </div>
      );
    }

    // 默认返回普通代码
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  };

  return (
    <ReactMarkdown
      components={{
        // 自定义代码渲染
        code: CodeBlock,
        // 自定义链接渲染
        a: ({ node, children, href, ...props }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-blue-500 hover:underline ${isDark ? 'text-blue-400' : ''}`}
            {...props}
          >
            {children}
          </a>
        ),
        // 自定义列表渲染
        ul: ({ children }) => (
          <ul className="list-disc list-inside my-2 space-y-1">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside my-2 space-y-1">
            {children}
          </ol>
        ),
        // 自定义标题渲染
        h1: ({ children }) => (
          <h1 className="text-2xl font-bold my-4">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-xl font-bold my-3">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-lg font-bold my-2">{children}</h3>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer; 