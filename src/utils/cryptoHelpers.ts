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
    if (!token) throw new Error('No token provided');

    // JWT is in format header.payload.signature
    const parts = token.split('.');
    if (parts.length < 2) throw new Error('Invalid JWT format');

    const payloadBase64 = parts[1]; // payload
    const decoded = Base64.decode(payloadBase64); // decode base64 → string

    return JSON.parse(decoded) as T;
  } catch (error) {
    console.error('decodeJWT error:', error);
    return null;
  }
};
