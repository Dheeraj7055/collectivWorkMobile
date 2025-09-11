// src/utils/logApiEvent.ts
type ApiLogType = 'REQUEST' | 'RESPONSE' | 'ERROR';

interface ApiLogOptions {
  url: string;
  method?: string;
  status?: number;
  data?: any;
  headers?: any;
  message?: string;
}

export const logApiEvent = (type: ApiLogType, options: ApiLogOptions) => {
  const { url, method, status, data, headers, message } = options;

  switch (type) {
    case 'REQUEST':
      console.log(
        `➡️ [API Request] ${method?.toUpperCase()} ${url}`,
        { headers, data }
      );
      break;

    case 'RESPONSE':
      console.log(
        `⬅️ [API Response] ${status} ${url}`,
        { data }
      );
      break;

    case 'ERROR':
      console.error(
        `❌ [API Error] ${status || ''} ${url}`,
        { message, data }
      );
      break;

    default:
      console.log(`[API Log] Unknown type: ${type}`, options);
  }
};
