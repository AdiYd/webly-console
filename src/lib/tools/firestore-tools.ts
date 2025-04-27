import { getAdminFirebase } from '@/lib/firebase/firebase-admin';
import { z } from 'zod';
import { serverLogger } from '@/utils/logger';

// Modified to lazy-load Firestore - only initialize when actually needed
const getFirestore = () => {
  try {
    return getAdminFirebase().db;
  } catch (error) {
    serverLogger.error('Firestore Tools', 'Failed to get Firestore instance', { error });
    throw new Error(
      'Failed to initialize Firestore: ' + (error instanceof Error ? error.message : String(error))
    );
  }
};

/**
 * Collection of tools for interacting with Firestore database
 */
export const firestoreTools = {
  /**
   * List all collections in the Firestore database
   */
  listCollections: {
    description: 'List all collections in the Firestore database',
    parameters: z.object({}),
    execute: async () => {
      try {
        const db = getFirestore();
        const collectionsSnapshot = await db.listCollections();
        const collections = collectionsSnapshot.map(collection => collection.id);

        if (collections.length === 0) {
          return 'No collections found in the database.';
        }

        serverLogger.info('Firestore', 'Collections listed successfully', {
          count: collections.length,
        });

        return `Found ${
          collections.length
        } collection(s) in the database:\n\`\`\`json\n${JSON.stringify(
          collections,
          null,
          2
        )}\n\`\`\``;
      } catch (error) {
        serverLogger.error('Firestore', 'Error listing collections', { error });
        throw new Error(
          `Error listing collections: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    },
  },

  /**
   * Check if a collection exists in the database
   */
  collectionExists: {
    description: 'Check if a specific collection exists in the database',
    parameters: z.object({
      collection: z.string().describe('Firestore collection name to check'),
    }),
    execute: async ({ collection }: any) => {
      try {
        const db = getFirestore();
        const collectionsSnapshot = await db.listCollections();
        const collections = collectionsSnapshot.map(col => col.id);
        const exists = collections.includes(collection);

        serverLogger.info('Firestore', 'Collection existence checked', {
          collection,
          exists,
        });

        return `Collection '${collection}' ${
          exists ? 'exists' : 'does not exist'
        } in the database.`;
      } catch (error) {
        serverLogger.error('Firestore', 'Error checking collection existence', {
          error,
          collection,
        });
        throw new Error(
          `Error checking if collection exists: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    },
  },

  /**
   * List all documents in a collection
   */
  listDocuments: {
    description: 'List all documents in a specific collection',
    parameters: z.object({
      collection: z.string().describe('Firestore collection name'),
      limit: z
        .number()
        .min(1)
        .max(1000)
        .default(100)
        .describe('Maximum number of documents to return'),
    }),
    execute: async ({ collection, limit }: any) => {
      try {
        const db = getFirestore();
        const collectionRef = db.collection(collection);
        const snapshot = await collectionRef.limit(limit).get();

        if (snapshot.empty) {
          return `No documents found in collection '${collection}'.`;
        }

        const documents = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        serverLogger.info('Firestore', 'Documents listed successfully', {
          collection,
          count: documents.length,
        });

        return `Retrieved ${
          documents.length
        } document(s) from collection '${collection}':\n\`\`\`json\n${JSON.stringify(
          documents,
          null,
          2
        )}\n\`\`\``;
      } catch (error) {
        serverLogger.error('Firestore', 'Error listing documents', { error, collection });
        throw new Error(
          `Error listing documents from collection '${collection}': ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    },
  },

  /**
   * Add a document to a Firestore collection
   */
  addDocument: {
    description:
      "Add a document to a Firestore collection (creates collection if it doesn't exist)",
    parameters: z.object({
      collection: z.string().describe('Firestore collection name'),
      data: z.record(z.any()).describe('Document data to add to the collection'),
      id: z.string().optional().describe('Optional document ID (auto-generated if not provided)'),
    }),
    execute: async ({ collection, data, id }: any) => {
      try {
        const db = getFirestore();
        let docRef;

        if (id) {
          // Use the provided ID
          docRef = db.collection(collection).doc(id);
          await docRef.set(data);
        } else {
          // Let Firestore auto-generate the ID
          docRef = await db.collection(collection).add(data);
        }

        serverLogger.info('Firestore', 'Document added successfully', {
          collection,
          id: docRef.id,
        });

        return `Document added successfully to '${collection}' with ID: ${docRef.id}`;
      } catch (error) {
        serverLogger.error('Firestore', 'Error adding document', { error, collection, data });
        throw new Error(
          `Error adding document to '${collection}': ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    },
  },

  /**
   * Get a document from a Firestore collection by ID
   */
  getDocument: {
    description: 'Get a document from a Firestore collection by ID',
    parameters: z.object({
      collection: z.string().describe('Firestore collection name'),
      id: z.string().describe('Document ID to retrieve'),
    }),
    execute: async ({ collection, id }: any) => {
      try {
        const db = getFirestore();
        const docRef = db.collection(collection).doc(id);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
          return `Document not found in '${collection}' with ID: ${id}`;
        }

        serverLogger.info('Firestore', 'Document retrieved successfully', { collection, id });

        // Format the document data as JSON string for readability
        const docData = docSnap.data();
        return `Retrieved document from '${collection}' with ID: ${id}:\n\`\`\`json\n${JSON.stringify(
          docData,
          null,
          2
        )}\n\`\`\``;
      } catch (error) {
        serverLogger.error('Firestore', 'Error getting document', { error, collection, id });
        throw new Error(
          `Error retrieving document from '${collection}': ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    },
  },

  /**
   * Query documents from a Firestore collection
   */
  queryDocuments: {
    description: 'Query documents from a Firestore collection with optional filters',
    parameters: z.object({
      collection: z.string().describe('Firestore collection name'),
      field: z.string().optional().describe('Field to filter on (optional)'),
      operator: z
        .enum(['==', '!=', '<', '<=', '>', '>='])
        .optional()
        .describe('Comparison operator'),
      value: z.any().optional().describe('Value to compare against'),
      limit: z
        .number()
        .min(1)
        .max(100)
        .default(10)
        .describe('Maximum number of documents to return'),
    }),
    execute: async ({ collection, field, operator, value, limit }: any) => {
      try {
        const db = getFirestore();
        let query: any = db.collection(collection);

        // Apply filter if all filter parameters are provided
        if (field && operator && value !== undefined) {
          query = query.where(field, operator, value);
        }

        // Apply limit
        query = query.limit(limit);

        const querySnapshot = await query.get();

        if (querySnapshot.empty) {
          return `No documents found in '${collection}' collection${
            field ? ` where ${field} ${operator} ${value}` : ''
          }`;
        }

        const documents = querySnapshot.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data(),
        }));

        serverLogger.info('Firestore', 'Documents queried successfully', {
          collection,
          count: documents.length,
          filter: field ? { field, operator, value } : 'none',
        });

        return `Retrieved ${documents.length} document(s) from '${collection}'${
          field ? ` where ${field} ${operator} ${value}` : ''
        }:\n\`\`\`json\n${JSON.stringify(documents, null, 2)}\n\`\`\``;
      } catch (error) {
        serverLogger.error('Firestore', 'Error querying documents', {
          error,
          collection,
          filter: field ? { field, operator, value } : 'none',
        });
        throw new Error(
          `Error querying documents from '${collection}': ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    },
  },

  /**
   * Update a document in a Firestore collection
   */
  updateDocument: {
    description: 'Update fields in an existing document',
    parameters: z.object({
      collection: z.string().describe('Firestore collection name'),
      id: z.string().describe('Document ID to update'),
      data: z.record(z.any()).describe('Document fields to update'),
    }),
    execute: async ({ collection, id, data }: any) => {
      try {
        const db = getFirestore();
        const docRef = db.collection(collection).doc(id);

        // Check if document exists
        const docSnap = await docRef.get();
        if (!docSnap.exists) {
          return `Document not found in '${collection}' with ID: ${id}`;
        }

        // Update the document
        await docRef.update(data);

        serverLogger.info('Firestore', 'Document updated successfully', { collection, id });

        return `Document updated successfully in '${collection}' with ID: ${id}`;
      } catch (error) {
        serverLogger.error('Firestore', 'Error updating document', { error, collection, id });
        throw new Error(
          `Error updating document in '${collection}': ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    },
  },

  /**
   * Recycle a document (move to 'recycle' collection instead of deleting)
   */
  recycleDocument: {
    description: 'Move a document to the recycle collection instead of permanently deleting it',
    parameters: z.object({
      collection: z.string().describe('Source Firestore collection name'),
      id: z.string().describe('Document ID to recycle'),
    }),
    execute: async ({ collection, id }: any) => {
      try {
        const db = getFirestore();
        const sourceDocRef = db.collection(collection).doc(id);

        // Check if document exists
        const docSnap = await sourceDocRef.get();
        if (!docSnap.exists) {
          return `Document not found in '${collection}' with ID: ${id}`;
        }

        // Get the document data
        const docData = docSnap.data();

        // Add metadata for restoration
        const recycleData = {
          ...docData,
          __recycled_from: {
            collection,
            id,
            timestamp: new Date(),
          },
        };

        // Create a transaction to ensure both operations complete
        await db.runTransaction(async transaction => {
          // Create the document in recycle collection
          const recycleDocRef = db.collection('recycle').doc();
          transaction.set(recycleDocRef, recycleData);

          // Delete the original document
          transaction.delete(sourceDocRef);
        });

        serverLogger.info('Firestore', 'Document recycled successfully', {
          sourceCollection: collection,
          sourceId: id,
          destinationCollection: 'recycle',
        });

        return `Document successfully moved from '${collection}' to 'recycle' collection for safekeeping.`;
      } catch (error) {
        serverLogger.error('Firestore', 'Error recycling document', { error, collection, id });
        throw new Error(
          `Error recycling document from '${collection}': ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    },
  },

  /**
   * Restore a document from the recycle collection
   */
  restoreDocument: {
    description: 'Restore a document from the recycle collection to its original location',
    parameters: z.object({
      recycleId: z.string().describe('ID of document in the recycle collection'),
    }),
    execute: async ({ recycleId }: any) => {
      try {
        const db = getFirestore();
        const recycleDocRef = db.collection('recycle').doc(recycleId);

        // Check if recycled document exists
        const recycleDocSnap = await recycleDocRef.get();
        if (!recycleDocSnap.exists) {
          return `Document not found in 'recycle' collection with ID: ${recycleId}`;
        }

        // Get the document data
        const recycleData = recycleDocSnap.data();
        if (!recycleData) {
          return `No data found for document with ID: ${recycleId}`;
        }
        const metadata = recycleData.__recycled_from;

        if (!metadata || !metadata.collection || !metadata.id) {
          return `Cannot restore document with ID: ${recycleId} - missing source information`;
        }

        // Create a clean version of the data (without metadata)
        const { __recycled_from, ...originalData } = recycleData;

        // Create a transaction to ensure both operations complete
        await db.runTransaction(async transaction => {
          // Restore to original location
          const originalDocRef = db.collection(metadata.collection).doc(metadata.id);
          transaction.set(originalDocRef, originalData);

          // Delete from recycle bin
          transaction.delete(recycleDocRef);
        });

        serverLogger.info('Firestore', 'Document restored successfully', {
          recycleId,
          restoredCollection: metadata.collection,
          restoredId: metadata.id,
        });

        return `Document successfully restored from 'recycle' to '${metadata.collection}' collection with ID: ${metadata.id}`;
      } catch (error) {
        serverLogger.error('Firestore', 'Error restoring document', { error, recycleId });
        throw new Error(
          `Error restoring document from recycle bin: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    },
  },

  /**
   * List recycled documents
   */
  listRecycledDocuments: {
    description: 'List all documents in the recycle collection',
    parameters: z.object({
      limit: z
        .number()
        .min(1)
        .max(1000)
        .default(100)
        .describe('Maximum number of recycled documents to return'),
    }),
    execute: async ({ limit }: any) => {
      try {
        const db = getFirestore();
        const recycleCollectionRef = db.collection('recycle');
        const snapshot = await recycleCollectionRef.limit(limit).get();

        if (snapshot.empty) {
          return 'No documents found in the recycle collection.';
        }

        const documents = snapshot.docs.map(doc => ({
          recycleId: doc.id,
          originalCollection: doc.data().__recycled_from?.collection,
          originalId: doc.data().__recycled_from?.id,
          recycledAt: doc.data().__recycled_from?.timestamp,
          ...doc.data(),
        }));

        serverLogger.info('Firestore', 'Recycled documents listed successfully', {
          count: documents.length,
        });

        return `Retrieved ${
          documents.length
        } document(s) from recycle collection:\n\`\`\`json\n${JSON.stringify(
          documents,
          null,
          2
        )}\n\`\`\``;
      } catch (error) {
        serverLogger.error('Firestore', 'Error listing recycled documents', { error });
        throw new Error(
          `Error listing recycled documents: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    },
  },

  /**
   * Get the count of documents in a collection
   */
  countDocuments: {
    description: 'Count the number of documents in a collection',
    parameters: z.object({
      collection: z.string().describe('Firestore collection name'),
      field: z.string().optional().describe('Field to filter on (optional)'),
      operator: z
        .enum(['==', '!=', '<', '<=', '>', '>='])
        .optional()
        .describe('Comparison operator'),
      value: z.any().optional().describe('Value to compare against'),
    }),
    execute: async ({ collection, field, operator, value }: any) => {
      try {
        const db = getFirestore();
        let query: any = db.collection(collection);

        // Apply filter if all filter parameters are provided
        if (field && operator && value !== undefined) {
          query = query.where(field, operator, value);
        }

        const snapshot = await query.get();
        const count = snapshot.size;

        serverLogger.info('Firestore', 'Documents counted successfully', {
          collection,
          count,
          filter: field ? { field, operator, value } : 'none',
        });

        return `Found ${count} document(s) in '${collection}'${
          field ? ` where ${field} ${operator} ${value}` : ''
        }.`;
      } catch (error) {
        serverLogger.error('Firestore', 'Error counting documents', {
          error,
          collection,
          filter: field ? { field, operator, value } : 'none',
        });
        throw new Error(
          `Error counting documents in '${collection}': ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    },
  },
};
