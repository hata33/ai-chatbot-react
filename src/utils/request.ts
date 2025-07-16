import { useStore } from '@/store/store';
import { toast } from 'sonner';

interface RequestConfig extends RequestInit {
  baseURL?: string;
  timeout?: number;
  withToken?: boolean;
}

class RequestError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: unknown
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

export async function request<T = unknown>(
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
    console.log('fetch', fullUrl, fetchConfig);
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

      const errorData: unknown = await response.json().catch(() => ({}));
      throw new RequestError(
        (errorData as { message?: string })?.message || response.statusText,
        response.status,
        errorData
      );
    }

    // 处理响应
    if (response.headers.get('content-type')?.includes('application/json')) {
      const data: unknown = await response.json();
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
      (error as { status?: number }).status || 500
    );
  }
}

// 便捷方法
export const http = {
  get: <T = any>(url: string, config?: RequestConfig) =>
    request<T>(url, { ...config, method: 'GET' }),

  post: <T, D = any>(url: string, data?: D, config?: RequestConfig) => {
    let body: BodyInit | undefined = undefined;
    let headers = config?.headers ? { ...config.headers } : {};
    if (data instanceof FormData) {
      body = data;
      // 不设置Content-Type，浏览器自动处理
    } else if (data !== undefined) {
      body = JSON.stringify(data);
      headers = { 'Content-Type': 'application/json', ...headers };
    }
    console.log('request', url, config, data)
    return request<T>(url, { ...config, method: 'POST', body, headers });
  },

  put: <T, D = any>(url: string, data?: D, config?: RequestConfig) =>
    request<T>(url, { ...config, method: 'PUT', body: JSON.stringify(data) }),

  delete: <T = any>(url: string, config?: RequestConfig) =>
    request<T>(url, { ...config, method: 'DELETE' }),

  // 流式请求
  stream: async (url: string, data?: unknown, config?: RequestConfig) => {
    const response = await request(url, {
      ...config,
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response as Response;
  },
}; 