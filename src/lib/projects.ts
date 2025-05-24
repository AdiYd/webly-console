import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { db } from './firebase/firebase-client';
import { getAdminFirebase } from './firebase/firebase-admin';
import {
  Project,
  ProjectListItem,
  ChatSession,
  ChatMessage,
  Asset,
  Attachment,
} from '@/types/project';
import { serverLogger, clientLogger } from '@/utils/logger';

// Client-side functions for project management

/**
 * Creates a new project for an organization
 */
export async function createProject(
  organizationId: string,
  projectData: Partial<Project>
): Promise<Project> {
  try {
    const projectId = uuidv4();
    const now = new Date().toISOString();

    const newProject: Project = {
      id: projectId,
      name: projectData.name || 'Untitled Project',
      description: projectData.description || '',
      createdAt: now,
      updatedAt: now,
      status: 'active',
      tags: projectData.tags || [],
      ...(projectData.thumbnail && { thumbnail: projectData.thumbnail }),
    };

    // Add project to Firestore
    await setDoc(doc(db, 'organizations', organizationId, 'projects', projectId), newProject);

    // Create initial chat session
    const sessionId = uuidv4();
    const initialSession: ChatSession = {
      id: sessionId,
      title: 'New Conversation',
      messages: [],
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(
      doc(db, 'organizations', organizationId, 'projects', projectId, 'chatSessions', sessionId),
      initialSession
    );

    clientLogger.info('Projects', `Created new project: ${projectData.name}`, {
      organizationId,
      projectId,
    });

    return {
      ...newProject,
      chatSessions: [initialSession],
    };
  } catch (error) {
    clientLogger.error('Projects', 'Failed to create project', error);
    throw error;
  }
}

/**
 * Gets a project by ID - overload for getting project with just projectId
 */
export async function getProject(projectId: string): Promise<Project | null>;

/**
 * Gets a project by ID - overload for getting project with organizationId and projectId
 */
export async function getProject(
  organizationId: string,
  projectId: string
): Promise<Project | null>;

/**
 * Gets a project by ID - implementation that handles both overloads
 */
export async function getProject(
  orgIdOrProjectId: string,
  maybeProjectId?: string
): Promise<Project | null> {
  try {
    let organizationId: string;
    let projectId: string;

    // Handle the case with just a projectId (find the organization first)
    if (!maybeProjectId) {
      projectId = orgIdOrProjectId;

      // Query to find which organization contains this project
      const allOrgsQuery = collection(db, 'organizations');
      const allOrgsSnapshot = await getDocs(allOrgsQuery);

      let foundProject = null;
      let foundOrgId = null;

      // Search through organizations to find the project
      for (const orgDoc of allOrgsSnapshot.docs) {
        const projectRef = doc(db, 'organizations', orgDoc.id, 'projects', projectId);
        const projectSnapshot = await getDoc(projectRef);

        if (projectSnapshot.exists()) {
          foundProject = projectSnapshot.data() as Project;
          foundOrgId = orgDoc.id;
          break;
        }
      }

      if (!foundProject || !foundOrgId) return null;

      // Update last accessed timestamp
      await updateDoc(doc(db, 'organizations', foundOrgId, 'projects', projectId), {
        lastAccessedAt: new Date().toISOString(),
      });

      // Get messages for this project
      const messagesQuery = collection(
        db,
        'organizations',
        foundOrgId,
        'projects',
        projectId,
        'messages'
      );

      const messagesSnapshot = await getDocs(messagesQuery);
      const messages = messagesSnapshot.docs.map(doc => doc.data() as ChatMessage);

      // Return project with messages included
      return {
        ...foundProject,
        messages: messages || [],
      };
    }

    // Original implementation (with both organizationId and projectId)
    organizationId = orgIdOrProjectId;
    projectId = maybeProjectId;

    // Get project data
    const projectDoc = await getDoc(
      doc(db, 'organizations', organizationId, 'projects', projectId)
    );

    if (!projectDoc.exists()) return null;

    const project = projectDoc.data() as Project;

    // Get messages for this project
    const messagesQuery = collection(
      db,
      'organizations',
      organizationId,
      'projects',
      projectId,
      'messages'
    );

    const messagesSnapshot = await getDocs(messagesQuery);
    const messages = messagesSnapshot.docs.map(doc => doc.data() as ChatMessage);

    // Update last accessed timestamp
    await updateDoc(doc(db, 'organizations', organizationId, 'projects', projectId), {
      lastAccessedAt: new Date().toISOString(),
    });

    // Return project with messages included
    return {
      ...project,
      messages: messages || [],
    };
  } catch (error) {
    clientLogger.error('Projects', 'Failed to get project', error);
    throw error;
  }
}

/**
 * Gets all projects for an organization
 */
export async function getProjects(organizationId: string): Promise<ProjectListItem[]> {
  try {
    const projectsQuery = query(
      collection(db, 'organizations', organizationId, 'projects'),
      where('status', '!=', 'deleted'),
      orderBy('status'),
      orderBy('updatedAt', 'desc')
    );

    const querySnapshot = await getDocs(projectsQuery);
    const projects: ProjectListItem[] = [];

    for (const doc of querySnapshot.docs) {
      const projectData = doc.data() as Project;

      // Get session counts
      const sessionsQuery = collection(
        db,
        'organizations',
        organizationId,
        'projects',
        doc.id,
        'chatSessions'
      );
      const sessionSnapshot = await getDocs(sessionsQuery);

      // Get asset counts
      const assetsQuery = collection(
        db,
        'organizations',
        organizationId,
        'projects',
        doc.id,
        'assets'
      );
      const assetSnapshot = await getDocs(assetsQuery);

      projects.push({
        id: doc.id,
        name: projectData.name,
        description: projectData.description,
        createdAt: projectData.createdAt,
        updatedAt: projectData.updatedAt,
        lastAccessedAt: projectData.lastAccessedAt,
        status: projectData.status,
        tags: projectData.tags,
        thumbnail: projectData.thumbnail,
        messageCount: sessionSnapshot.docs.reduce((count, sessionDoc) => {
          const session = sessionDoc.data() as ChatSession;
          return count + (session.messages?.length || 0);
        }, 0),
        assetCount: assetSnapshot.size,
      });
    }

    return projects;
  } catch (error) {
    clientLogger.error('Projects', 'Failed to get projects', error);
    throw error;
  }
}

/**
 * Updates an existing project
 */
export async function updateProject(
  organizationId: string,
  projectId: string,
  updates: Partial<Project>
): Promise<void> {
  try {
    const projectRef = doc(db, 'organizations', organizationId, 'projects', projectId);

    // Only include updatable fields
    const validUpdates: Partial<Project> = {
      ...(updates.name !== undefined && { name: updates.name }),
      ...(updates.description !== undefined && { description: updates.description }),
      ...(updates.status !== undefined && { status: updates.status }),
      ...(updates.tags !== undefined && { tags: updates.tags }),
      ...(updates.thumbnail !== undefined && { thumbnail: updates.thumbnail }),
      updatedAt: new Date().toISOString(),
    };

    await updateDoc(projectRef, validUpdates);

    clientLogger.info('Projects', `Updated project: ${projectId}`, { organizationId });
  } catch (error) {
    clientLogger.error('Projects', 'Failed to update project', error);
    throw error;
  }
}

/**
 * Archives a project (soft delete)
 */
export async function archiveProject(organizationId: string, projectId: string): Promise<void> {
  try {
    const projectRef = doc(db, 'organizations', organizationId, 'projects', projectId);

    await updateDoc(projectRef, {
      status: 'archived',
      updatedAt: new Date().toISOString(),
    });

    clientLogger.info('Projects', `Archived project: ${projectId}`, { organizationId });
  } catch (error) {
    clientLogger.error('Projects', 'Failed to archive project', error);
    throw error;
  }
}

/**
 * Permanently deletes a project
 */
export async function deleteProject(organizationId: string, projectId: string): Promise<void> {
  try {
    // Mark as deleted first (soft delete)
    const projectRef = doc(db, 'organizations', organizationId, 'projects', projectId);

    await updateDoc(projectRef, {
      status: 'deleted',
      updatedAt: new Date().toISOString(),
    });

    // Could implement hard delete with proper cleanup later
    clientLogger.info('Projects', `Deleted project: ${projectId}`, { organizationId });
  } catch (error) {
    clientLogger.error('Projects', 'Failed to delete project', error);
    throw error;
  }
}

/**
 * Gets chat sessions for a project
 */
export async function getChatSessions(
  organizationId: string,
  projectId: string
): Promise<ChatSession[]> {
  try {
    const sessionsQuery = query(
      collection(db, 'organizations', organizationId, 'projects', projectId, 'chatSessions'),
      orderBy('updatedAt', 'desc')
    );

    const querySnapshot = await getDocs(sessionsQuery);
    const sessions: ChatSession[] = [];

    querySnapshot.forEach(doc => {
      sessions.push(doc.data() as ChatSession);
    });

    return sessions;
  } catch (error) {
    clientLogger.error('Projects', 'Failed to get chat sessions', error);
    throw error;
  }
}

/**
 * Creates a new chat session for a project
 */
export async function createChatSession(
  organizationId: string,
  projectId: string,
  title: string = 'New Conversation'
): Promise<ChatSession> {
  try {
    const sessionId = uuidv4();
    const now = new Date().toISOString();

    const newSession: ChatSession = {
      id: sessionId,
      title,
      messages: [],
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(
      doc(db, 'organizations', organizationId, 'projects', projectId, 'chatSessions', sessionId),
      newSession
    );

    return newSession;
  } catch (error) {
    clientLogger.error('Projects', 'Failed to create chat session', error);
    throw error;
  }
}

/**
 * Gets a specific chat session
 */
export async function getChatSession(
  organizationId: string,
  projectId: string,
  sessionId: string
): Promise<ChatSession | null> {
  try {
    const sessionDoc = await getDoc(
      doc(db, 'organizations', organizationId, 'projects', projectId, 'chatSessions', sessionId)
    );

    if (!sessionDoc.exists()) return null;
    return sessionDoc.data() as ChatSession;
  } catch (error) {
    clientLogger.error('Projects', 'Failed to get chat session', error);
    throw error;
  }
}

/**
 * Adds a message to a chat session
 */
export async function addChatMessage(
  organizationId: string,
  projectId: string,
  sessionId: string,
  message: Omit<ChatMessage, 'id'>
): Promise<ChatMessage> {
  try {
    const sessionRef = doc(
      db,
      'organizations',
      organizationId,
      'projects',
      projectId,
      'chatSessions',
      sessionId
    );

    const sessionDoc = await getDoc(sessionRef);
    if (!sessionDoc.exists()) {
      throw new Error('Chat session not found');
    }

    const session = sessionDoc.data() as ChatSession;
    const messageId = uuidv4();

    const newMessage: ChatMessage = {
      ...message,
      id: messageId,
    };

    // Add message to session
    const updatedMessages = [...(session.messages || []), newMessage];

    await updateDoc(sessionRef, {
      messages: updatedMessages,
      updatedAt: new Date().toISOString(),
    });

    // If this is the first message, update the session title
    if (session.messages?.length === 0 && message.role === 'user') {
      // Generate a title from the first user message
      const userContent =
        typeof message.content === 'string'
          ? message.content
          : message.content?.find(part => part.type === 'text')?.text || '';

      const title = userContent.substring(0, 30) + (userContent.length > 30 ? '...' : '');

      await updateDoc(sessionRef, {
        title,
      });
    }

    return newMessage;
  } catch (error) {
    clientLogger.error('Projects', 'Failed to add chat message', error);
    throw error;
  }
}

/**
 * Uploads an asset file for a project
 */
export async function uploadProjectAsset(
  organizationId: string,
  projectId: string,
  file: File,
  type: 'image' | 'document' | 'code',
  metadata: Record<string, any> = {}
): Promise<Asset> {
  try {
    const assetId = uuidv4();
    const storage = getStorage();
    const storageRef = ref(
      storage,
      `organizations/${organizationId}/projects/${projectId}/assets/${assetId}`
    );

    // Upload file to storage
    await uploadBytes(storageRef, file, {
      customMetadata: {
        ...metadata,
        organizationId,
        projectId,
        assetId,
      },
    });

    // Get download URL
    const downloadUrl = await getDownloadURL(storageRef);

    // Create asset document
    const asset: Asset = {
      id: assetId,
      name: file.name,
      type,
      contentType: file.type,
      path: `organizations/${organizationId}/projects/${projectId}/assets/${assetId}`,
      url: downloadUrl,
      createdAt: new Date().toISOString(),
      metadata,
    };

    // Save asset metadata to Firestore
    await setDoc(
      doc(db, 'organizations', organizationId, 'projects', projectId, 'assets', assetId),
      asset
    );

    return asset;
  } catch (error) {
    clientLogger.error('Projects', 'Failed to upload asset', error);
    throw error;
  }
}

/**
 * Gets all assets for a project
 */
export async function getProjectAssets(
  organizationId: string,
  projectId: string
): Promise<Asset[]> {
  try {
    const assetsQuery = query(
      collection(db, 'organizations', organizationId, 'projects', projectId, 'assets'),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(assetsQuery);
    const assets: Asset[] = [];

    querySnapshot.forEach(doc => {
      assets.push(doc.data() as Asset);
    });

    return assets;
  } catch (error) {
    clientLogger.error('Projects', 'Failed to get assets', error);
    throw error;
  }
}

/**
 * Creates an attachment reference from an asset
 */
export function createAttachmentFromAsset(asset: Asset): Attachment {
  return {
    id: uuidv4(),
    assetId: asset.id,
    type: asset.type as 'image' | 'document',
    name: asset.name,
    contentType: asset.contentType,
    url: asset.url,
    ...(asset.type === 'image' && asset.url && { image: asset.url }),
  };
}
