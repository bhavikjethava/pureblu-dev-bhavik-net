// cookieUtils.ts
'use server';
import { cookies } from 'next/headers';
const cookieStore = cookies();

export const setClientCookie = (name: string, value: string) => {
  cookies().set(name, value);
};

export const getClientCookie = (type: string) => {
  // Check if the cookie exists
  if (cookies().has(type)) {
    // Get the cookie
    const encodedSessionData = cookies().get(type);

    // Check if encodedSessionData is a string
    if (encodedSessionData) {
      const encodedString = encodedSessionData.value;

      // Decode the cookie from Base64 back to a string
      const sessionData = Buffer.from(encodedString, 'base64').toString(
        'utf-8'
      );

      // Return the decoded session data
      return sessionData;
    }
  }

  // If the cookie doesn't exist, or isn't a string, return null or another appropriate value
  return null;
};
