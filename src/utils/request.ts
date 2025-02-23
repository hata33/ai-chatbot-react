import { useStore } from '@/store/store';
import { toast } from 'sonner';

interface RequestConfig extends RequestInit {
  baseURL?: string;
  timeout?: number;
  withToken?: boolean;
}

interface ResponseType<T = any> {
  code: number;
  data: T;
  message: string;
}

class RequestError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: any
  ) {
    super(message);
    this.name = 'RequestError';
  }
}

const DEFAULT_CONFIG: RequestConfig = {
  baseURL: '/api',
  timeout: 30000,
  withToken: true,
  headers: {
    'Content-Type': 'application/json',
  },
};

// 首先定义一个接口来描述可能的错误类型
interface ErrorWithMessage {
  message: string;
  name: string;
  status?: number;
}

// 类型保护函数
function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    'name' in error
  );
}

export async function request<T = any>(
  url: string,
  config: RequestConfig = {}
): Promise<T> {
  // 合并配置
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const { baseURL, timeout, withToken, ...fetchConfig } = finalConfig;

  // 处理 URL
  const fullUrl = `${baseURL}${url.startsWith('/') ? url : `/${url}`}`;

  // 处理 headers
  const headers = new Headers(fetchConfig.headers);
  if (withToken) {
    const token = useStore.getState().token;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  // 创建 AbortController 用于超时控制
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(fullUrl, {
      ...fetchConfig,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // 处理 HTTP 状态码
    if (!response.ok) {
      if (response.status === 401) {
        useStore.getState().logout();
        toast.error('登录已过期，请重新登录');
        window.location.href = '/login';
        throw new RequestError('Unauthorized', 401);
      }

      const errorData = await response.json().catch(() => ({}));
      throw new RequestError(
        errorData.message || response.statusText,
        response.status,
        errorData
      );
    }

    // 处理响应
    if (response.headers.get('content-type')?.includes('application/json')) {
      const data = await response.json();
      return data as T;
    }

    // 处理流式响应
    if (response.headers.get('content-type')?.includes('text/event-stream')) {
      return response as unknown as T;
    }

    return response as unknown as T;
  } catch (error: unknown) {
    if (error instanceof RequestError) {
      throw error;
    }

    const err = error as Error;
    
    if (err.name === 'AbortError') {
      throw new RequestError('请求超时', 408);
    }

    throw new RequestError(
      err.message || '网络请求失败',
      (error as any).status || 500
    );
  }
}

// 便捷方法
export const http = {
  get: <T = any>(url: string, config?: RequestConfig) =>
    request<T>(url, { ...config, method: 'GET' }),

  post: <T = any>(url: string, data?: any, config?: RequestConfig) =>
    request<T>(url, { ...config, method: 'POST', body: JSON.stringify(data) }),

  put: <T = any>(url: string, data?: any, config?: RequestConfig) =>
    request<T>(url, { ...config, method: 'PUT', body: JSON.stringify(data) }),

  delete: <T = any>(url: string, config?: RequestConfig) =>
    request<T>(url, { ...config, method: 'DELETE' }),

  // 流式请求
  stream: async (url: string, data?: any, config?: RequestConfig) => {
    const response = await request(url, {
      ...config,
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response as Response;
  },
}; 