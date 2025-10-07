type Options = {
  body?: Record<string, unknown>;
  cache?: RequestCache;
  headers?: HeadersInit;
  responseType?: 'json' | 'stream' | 'text' | 'arrayBuffer';
  signal?: AbortSignal;
};

type FetchMethod = (url: string, options?: Options) => Promise<any>;

class Fetcher {
  get: FetchMethod = async (url, options) => {
    if (options?.responseType === 'json') {
      const res = await fetch(url, { headers: options.headers });

      return await res.json();
    }

    if (options?.responseType === 'text') {
      const res = await fetch(url, {
        cache: options?.cache ?? 'force-cache',
        headers: options.headers,
      });

      return await res.text();
    }

    if (options?.responseType === 'arrayBuffer') {
      const res = await fetch(url, {
        cache: options?.cache ?? 'force-cache',
        headers: options.headers,
      });

      return await res.arrayBuffer();
    }

    return fetch(url);
  };

  post: FetchMethod = async (url, options) => {
    const fetchOptions = {
      method: 'POST',
      body: JSON.stringify(options?.body),
      cache: options?.cache ?? 'force-cache',
      headers: options?.headers,
      signal: options?.signal,
    };

    if (options?.responseType === 'json') {
      const res = await fetch(url, fetchOptions);

      return await res.json();
    }

    return fetch(url, fetchOptions);
  };

  put: FetchMethod = async (url, options) => {
    const fetchOptions = {
      body: JSON.stringify(options?.body),
      headers: options?.headers,
      method: 'PUT',
      signal: options?.signal,
    };

    if (options?.responseType === 'json') {
      const res = await fetch(url, fetchOptions);

      return await res.json();
    }

    return fetch(url, fetchOptions);
  };

  patch: FetchMethod = async (url, options) => {
    const fetchOptions = {
      method: 'PATCH',
      body: JSON.stringify(options?.body),
      headers: options?.headers,
      signal: options?.signal,
    };

    if (options?.responseType === 'json') {
      const res = await fetch(url, fetchOptions);

      return await res.json();
    }

    return fetch(url, fetchOptions);
  };

  delete: FetchMethod = async (url: string, options) => {
    const fetchOptions = {
      method: 'DELETE',
      headers: options?.headers,
    };

    return fetch(url, fetchOptions);
  };
}

export const fetcher = new Fetcher();
