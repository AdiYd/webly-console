import { Timestamp } from 'firebase-admin/firestore';

export interface Agent {
  id: string;
  name: string;
  role: string;
  description?: string;
  prompt?: string;
  createdAt: string | Timestamp;
  updatedAt: string | Timestamp;
}
