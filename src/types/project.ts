import { AIProvider } from '@/context/OrganizationContext';
import { Timestamp } from 'firebase/firestore';

// Project-related types
export interface ProjectListItem {
  id: string;
  name: string;
  description?: string;
  createdAt: string | Timestamp;
  updatedAt: string | Timestamp;
  messageCount?: number;
  assetCount?: number;
}

export interface Project extends ProjectListItem {
  messages?: ChatMessage[];
  assets?: Asset[];
  settings?: ProjectSettings;
  lastMessageAt?: string; // Add this line
}

// Project settings
export interface ProjectSettings {
  aiProvider?: AIProvider;
  model?: string;
  temperature?: number;
  saveHistory?: boolean;
  publicShare?: boolean;
}

// Chat-related types
export interface ChatSession {
  id: string;
  title?: string;
  createdAt: string | Timestamp;
  updatedAt: string | Timestamp;
  messages: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string | Timestamp;
  metadata: Record<string, any>;
  sourceMessageId?: string;
}

// Asset-related types
export interface Asset {
  id: string;
  type: 'image' | 'code' | 'document' | 'audio' | 'other';
  sourceMessageId?: string;
  url?: string;
  content?: string;
  metadata: {
    size?: number;
    format?: string;
    modelUsed?: string;
    [key: string]: any;
  };
  createdAt: string | Timestamp;
}

export interface Attachment {
  type: string; // 'image' | 'document'
  name?: string;
  contentType?: string;
  url?: string;
  image?: string;
  file?: {
    name: string;
    url: string;
    type: string;
  };
  _metadata?: {
    size: number;
    type: string;
  };
}
