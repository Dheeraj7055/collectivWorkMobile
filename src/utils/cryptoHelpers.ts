import { Base64 } from 'js-base64';

export const encodeData = (payload: unknown): string => {
  try {
    if (!payload) throw new Error('No payload provided to encode');
    const dataString = JSON.stringify(payload);
    let encoded = Base64.encode(encodeURI(dataString));
    encoded = encoded.replace(/=+$/, ''); // strip padding
    return encoded;
  } catch (error) {
    console.error('encodeData error:', error);
    return '';
  }
};

export const decodeData = <T = any>(token: string): T | null => {
  try {
    if (!token) throw new Error('No token provided to decode');
    const decoded = Base64.decode(token);
    return JSON.parse(decodeURI(decoded)) as T;
  } catch (error) {
    console.error('decodeData error:', error);
    return null;
  }
};
