import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines Tailwind CSS classes with clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  // console.log("Combining classes:", inputs);
  return twMerge(clsx(inputs));
}

/**
 * Formats a date to a more readable string
 * @param date Date object or ISO string
 * @param options Intl.DateTimeFormatOptions
 */
export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }
) {
  return new Intl.DateTimeFormat('en-US', options).format(
    typeof date === 'string' ? new Date(date) : date
  );
}

/**
 * Truncates a string to a specific length
 * @param str String to truncate
 * @param n Maximum length
 */
export function truncate(str: string, n: number): string {
  if (str.length <= n) return str;
  return str.slice(0, n) + '...';
}

/**
 * Calculates the estimated reading time for a piece of content
 * @param content Text content
 * @param wordsPerMinute Average reading speed (default: 200)
 * @returns Reading time in minutes
 */
export function calculateReadingTime(content: string, wordsPerMinute = 200): number {
  const wordCount = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

/**
 * Delay execution using a promise
 * @param ms Milliseconds to delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function multiple times with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: { maxRetries: number; baseDelay: number } = {
    maxRetries: 3,
    baseDelay: 300,
  }
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt < options.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      const delayTime = options.baseDelay * Math.pow(2, attempt);
      await delay(delayTime);
    }
  }

  throw lastError!;
}

/**
 * Converts a stream to a string (useful for AI streaming responses)
 */
export async function streamToString(stream: ReadableStream): Promise<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let result = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      result += decoder.decode(value, { stream: true });
    }
    result += decoder.decode(); // flush the decoder
    return result;
  } finally {
    reader.releaseLock();
  }
}

/**
 * Safely parse JSON with error handling
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    console.error('Failed to parse JSON:', error);
    return fallback;
  }
}

/**
 * Extract text content from Markdown
 */
export function extractTextFromMarkdown(markdown: string): string {
  // Remove code blocks
  let text = markdown.replace(/```[\s\S]*?```/g, '');

  // Remove inline code
  text = text.replace(/`([^`]+)`/g, '$1');

  // Remove headings
  text = text.replace(/#{1,6}\s?(.*)/g, '$1');

  // Remove bold/italic
  text = text.replace(/(\*\*|__)(.*?)\1/g, '$2');
  text = text.replace(/(\*|_)(.*?)\1/g, '$2');

  // Remove links
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  return text.trim();
}
