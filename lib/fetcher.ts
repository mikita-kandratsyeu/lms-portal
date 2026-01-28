type Options = {
  body?: Record<string, unknown> | FormData;
  cache?: RequestCache;
  headers?: HeadersInit;
  responseType?: 'json' | 'stream' | 'text' | 'arrayBuffer';
  signal?: AbortSignal;
};

type FetchMethod = (url: string, options?: Options) => Promise<any>;

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

const handleResponse = async (res: Response, responseType?: Options['responseType']) => {
  if (!res.ok) {
    let message = '';

    try {
      message = await res.text();
    } catch {
      message = res.statusText || 'Request Failed';
    }

    throw new ApiError(message || `HTTP ${res.status}`, res.status);
  }

  switch (responseType) {
    case 'json':
      return res.json();
    case 'text':
      return res.text();
    case 'arrayBuffer':
      return res.arrayBuffer();
    case 'stream':
      return res.body;
    default:
      return res;
  }
};

class Fetcher {
  get: FetchMethod = async (url, options) => {
    const res = await fetch(url, {
      cache: options?.cache ?? 'force-cache',
      headers: options?.headers,
      signal: options?.signal,
    });

    return handleResponse(res, options?.responseType);
  };

  post: FetchMethod = async (url, options) => {
    const body = options?.body;
    const isFormData = body instanceof FormData;

    const res = await fetch(url, {
      method: 'POST',
      body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
      cache: options?.cache ?? 'force-cache',
      headers: options?.headers,
      signal: options?.signal,
    });

    return handleResponse(res, options?.responseType);
  };

  put: FetchMethod = async (url, options) => {
    const body = options?.body;
    const isFormData = body instanceof FormData;

    const res = await fetch(url, {
      method: 'PUT',
      body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
      headers: options?.headers,
      signal: options?.signal,
    });

    return handleResponse(res, options?.responseType);
  };

  patch: FetchMethod = async (url, options) => {
    const body = options?.body;
    const isFormData = body instanceof FormData;

    const res = await fetch(url, {
      method: 'PATCH',
      body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
      headers: options?.headers,
      signal: options?.signal,
    });

    return handleResponse(res, options?.responseType);
  };

  delete: FetchMethod = async (url, options) => {
    const res = await fetch(url, {
      method: 'DELETE',
      headers: options?.headers,
      signal: options?.signal,
    });

    return handleResponse(res, options?.responseType);
  };
}

export const fetcher = new Fetcher();
