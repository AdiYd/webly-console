import { getAdminFirebase } from '@/lib/firebase/firebase-admin';
import { z } from 'zod';
import { serverLogger } from '@/utils/logger';
import { auth } from '@/auth';

// Modified to lazy-load Firestore - only initialize when actually needed
const getFirestore = async () => {
  const session = await auth();
  const sessionClient = session?.user?.email || 'demo';
  serverLogger.warn('Firestore Tools', 'Using session client', {
    session: session?.user,
    more: session?.user.email,
  });

  try {
    const adminFirebase = getAdminFirebase();
    const rootPath = `projects/${sessionClient}`;

    // Create a scoped Firestore wrapper that only allows access to the user's data
    const scopedDb = {
      // Collection methods that prefix the collection path with the user's root path
      collection: (collectionPath: string) => {
        return adminFirebase.db.collection(`${rootPath}/${collectionPath}`);
      },

      // List collections within the user's scope
      listCollections: async () => {
        const rootDocRef = adminFirebase.db.doc(rootPath);
        return (await rootDocRef.listCollections()).filter(col => col.id !== 'recycle');
      },

      // Document reference with the proper path prefix
      doc: (path: string) => {
        return adminFirebase.db.doc(`${rootPath}/${path}`);
      },

      // Transaction support that preserves the original Firestore capability
      runTransaction: (callback: (transaction: any) => Promise<any>) => {
        return adminFirebase.db.runTransaction(callback);
      },
    };

    return scopedDb;
  } catch (error) {
    serverLogger.error('Firestore Tools', 'Failed to get Firestore instance', { error });
    return {
      error: `Failed to initialize Firestore: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
};

// Helper function to format errors consistently for tools
const formatErrorResponse = (operation: string, error: any): string => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  return `Error during operation "${operation}": ${errorMessage}\n\nPlease check your parameters and try again.`;
};

/**
 * Collection of tools for interacting with Firestore database
 */
export const firestoreTools = {
  /**
   * Manage Firestore collections - list collections, check if a collection exists, count documents, and list documents
   */
  manageCollections: {
    description:
      'Manage Firestore collections with various operations including listing collections, checking existence, counting and listing documents',
    parameters: z.object({
      operation: z
        .enum(['list', 'exists', 'count', 'listDocs'])
        .describe(
          'Operation to perform: "list" to list all collections, "exists" to check if a collection exists, "count" to count documents in a collection, "listDocs" to list documents in a collection'
        ),
      collection: z
        .string()
        .optional()
        .describe('Collection name - required for "exists", "count", and "listDocs" operations'),
      limit: z
        .number()
        .min(1)
        .max(1000)
        .default(100)
        .optional()
        .describe(
          'Maximum number of results to return for "list" or "listDocs" operations (default: 100)'
        ),
      field: z.string().optional().describe('Field to filter on for "count" operation (optional)'),
      operator: z
        .enum(['==', '!=', '<', '<=', '>', '>='])
        .optional()
        .describe('Comparison operator for "count" operation (required if field is provided)'),
      value: z
        .any()
        .optional()
        .describe('Value to compare against for "count" operation (required if field is provided)'),
    }),
    execute: async ({ operation, collection, limit = 100, field, operator, value }: any) => {
      try {
        const db = await getFirestore();
        // Check if db initialization failed
        if ('error' in db) {
          return formatErrorResponse('initialize', db.error);
        }

        // LIST COLLECTIONS
        if (operation === 'list') {
          const collectionsSnapshot = await db.listCollections();
          const collections = collectionsSnapshot.map(col => col.id);

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
        }

        // CHECK COLLECTION EXISTS
        else if (operation === 'exists') {
          if (!collection) {
            return formatErrorResponse(
              'exists',
              'Collection name is required for "exists" operation'
            );
          }

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
        }

        // COUNT DOCUMENTS
        else if (operation === 'count') {
          if (!collection) {
            return formatErrorResponse(
              'count',
              'Collection name is required for "count" operation'
            );
          }

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
        }

        // LIST DOCUMENTS
        else if (operation === 'listDocs') {
          if (!collection) {
            return formatErrorResponse(
              'listDocs',
              'Collection name is required for "listDocs" operation'
            );
          }

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
        }

        return formatErrorResponse('manageCollections', `Invalid operation: ${operation}`);
      } catch (error) {
        serverLogger.error('Firestore', 'Error in manageCollections', {
          error,
          operation,
          collection,
        });
        return formatErrorResponse('manageCollections', error);
      }
    },
  },

  /**
   * Manage Firestore documents - get, add, update, or query documents in a collection
   */
  manageDocuments: {
    description:
      'Manage Firestore documents - get, add, update, or query documents in a collection',
    parameters: z.object({
      operation: z
        .enum(['get', 'add', 'update', 'query'])
        .describe(
          'Operation to perform: "get" to retrieve a document, "add" to create a document, "update" to modify a document, "query" to search for documents'
        ),
      collection: z.string().describe('Firestore collection name'),
      id: z
        .string()
        .optional()
        .describe(
          'Document ID - required for "get" and "update" operations, optional for "add" (auto-generated if not provided)'
        ),
      data: z
        .record(z.any())
        .optional()
        .describe(
          'The Document data object to add or update - REQUIRED for "add" and "update" operations. This contains the actual document fields and values.'
        ),
      field: z.string().optional().describe('Field to filter on for "query" operation (optional)'),
      operator: z
        .enum(['==', '!=', '<', '<=', '>', '>='])
        .optional()
        .describe('Comparison operator for "query" operation (required if field is provided)'),
      value: z
        .any()
        .optional()
        .describe(
          'Value to compare against for "query" operation (required if field is provided). NOT to be confused with "data" parameter, which is used for document content.'
        ),
      limit: z
        .number()
        .min(1)
        .max(100)
        .default(10)
        .optional()
        .describe('Maximum number of documents to return for "query" operation (default: 10)'),
    }),
    execute: async ({
      operation,
      collection,
      id,
      data,
      field,
      operator,
      value,
      limit = 10,
    }: any) => {
      try {
        const db = await getFirestore();
        // Check if db initialization failed
        if ('error' in db) {
          return formatErrorResponse('initialize', db.error);
        }

        // Handle common parameter mistakes: If 'value' is provided as an object but 'data' is missing for add/update operations
        // This handles the case where someone used 'value' instead of 'data' for the document content
        if (
          (operation === 'add' || operation === 'update') &&
          !data &&
          value &&
          typeof value === 'object' &&
          !Array.isArray(value)
        ) {
          serverLogger.warn('Firestore', 'Parameter correction', {
            message: 'Used "value" instead of "data" for document content',
            operation,
            collection,
          });
          data = value;
        }

        // GET DOCUMENT
        if (operation === 'get') {
          if (!id) {
            return formatErrorResponse('get', 'Document ID is required for "get" operation');
          }

          if (!collection) {
            return formatErrorResponse('get', 'Collection name is required for "get" operation');
          }

          const docRef = db.collection(collection).doc(id);
          const docSnap = await docRef.get();

          if (!docSnap.exists) {
            return `Document not found in '${collection}' with ID: ${id}`;
          }

          serverLogger.info('Firestore', 'Document retrieved successfully', { collection, id });

          const docData = docSnap.data();
          return `Retrieved document from '${collection}' with ID: ${id}:\n\`\`\`json\n${JSON.stringify(
            docData,
            null,
            2
          )}\n\`\`\``;
        }

        // ADD DOCUMENT
        else if (operation === 'add') {
          if (!collection) {
            return formatErrorResponse('add', 'Collection name is required for "add" operation');
          }

          if (!data) {
            return formatErrorResponse(
              'add',
              'Document data is required for "add" operation. Please provide a "data" parameter with the document fields.'
            );
          }

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
        }

        // UPDATE DOCUMENT
        else if (operation === 'update') {
          if (!collection) {
            return formatErrorResponse(
              'update',
              'Collection name is required for "update" operation'
            );
          }

          if (!id) {
            return formatErrorResponse('update', 'Document ID is required for "update" operation');
          }

          if (!data) {
            return formatErrorResponse(
              'update',
              'Document data is required for "update" operation. Please provide a "data" parameter with the fields to update.'
            );
          }

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
        }

        // QUERY DOCUMENTS
        else if (operation === 'query') {
          if (!collection) {
            return formatErrorResponse(
              'query',
              'Collection name is required for "query" operation'
            );
          }

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
        }

        return formatErrorResponse('manageDocuments', `Invalid operation: ${operation}`);
      } catch (error) {
        serverLogger.error('Firestore', 'Error in manageDocuments', {
          error,
          operation,
          collection,
          id,
        });
        return formatErrorResponse('manageDocuments', error);
      }
    },
  },

  /**
   * Manage recycled documents - recycle, restore, or list documents in the recycle bin
   */
  manageRecycleBin: {
    description:
      'Manage recycled documents - recycle, restore, or list documents in the recycle bin',
    parameters: z.object({
      operation: z
        .enum(['recycle', 'restore', 'list'])
        .describe(
          'Operation to perform: "recycle" to move a document to recycle bin, "restore" to recover a document, "list" to view recycled documents'
        ),
      collection: z
        .string()
        .optional()
        .describe('Source collection name - required for "recycle" operation'),
      id: z.string().optional().describe('Document ID - required for "recycle" operation'),
      recycleId: z
        .string()
        .optional()
        .describe('ID of document in recycle bin - required for "restore" operation'),
      limit: z
        .number()
        .min(1)
        .max(1000)
        .default(100)
        .optional()
        .describe(
          'Maximum number of recycled documents to return for "list" operation (default: 100)'
        ),
    }),
    execute: async ({ operation, collection, id, recycleId, limit = 100 }: any) => {
      try {
        const db = await getFirestore();
        // Check if db initialization failed
        if ('error' in db) {
          return formatErrorResponse('initialize', db.error);
        }

        // RECYCLE DOCUMENT
        if (operation === 'recycle') {
          if (!collection) {
            return formatErrorResponse(
              'recycle',
              'Collection name is required for "recycle" operation'
            );
          }

          if (!id) {
            return formatErrorResponse(
              'recycle',
              'Document ID is required for "recycle" operation'
            );
          }

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

          try {
            // Create a transaction to ensure both operations complete
            await db.runTransaction(async transaction => {
              // Create the document in recycle collection
              const recycleDocRef = db.collection('recycle').doc();
              transaction.set(recycleDocRef, recycleData);

              // Delete the original document
              transaction.delete(sourceDocRef);
            });
          } catch (txError) {
            return formatErrorResponse(
              'recycle-transaction',
              `Transaction failed while recycling document: ${
                txError instanceof Error ? txError.message : String(txError)
              }`
            );
          }

          serverLogger.info('Firestore', 'Document recycled successfully', {
            sourceCollection: collection,
            sourceId: id,
            destinationCollection: 'recycle',
          });

          return `Document successfully moved from '${collection}' to 'recycle' collection for safekeeping.`;
        }

        // RESTORE DOCUMENT
        else if (operation === 'restore') {
          if (!recycleId) {
            return formatErrorResponse('restore', 'Recycle ID is required for "restore" operation');
          }

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

          try {
            // Create a transaction to ensure both operations complete
            await db.runTransaction(async transaction => {
              // Restore to original location
              const originalDocRef = db.collection(metadata.collection).doc(metadata.id);
              transaction.set(originalDocRef, originalData);

              // Delete from recycle bin
              transaction.delete(recycleDocRef);
            });
          } catch (txError) {
            return formatErrorResponse(
              'restore-transaction',
              `Transaction failed while restoring document: ${
                txError instanceof Error ? txError.message : String(txError)
              }`
            );
          }

          serverLogger.info('Firestore', 'Document restored successfully', {
            recycleId,
            restoredCollection: metadata.collection,
            restoredId: metadata.id,
          });

          return `Document successfully restored from 'recycle' to '${metadata.collection}' collection with ID: ${metadata.id}`;
        }

        // LIST RECYCLED DOCUMENTS
        else if (operation === 'list') {
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
        }

        return formatErrorResponse('manageRecycleBin', `Invalid operation: ${operation}`);
      } catch (error) {
        serverLogger.error('Firestore', 'Error in manageRecycleBin', {
          error,
          operation,
          collection,
          id,
          recycleId,
        });
        return formatErrorResponse('manageRecycleBin', error);
      }
    },
  },

  /**
   * Execute complex queries on Firestore data with multiple filters and conditions
   */
  executeComplexQuery: {
    description:
      'Execute complex queries on Firestore data with support for multiple filters, ordering, and pagination',
    parameters: z.object({
      collection: z.string().describe('Firestore collection to query'),
      filters: z
        .array(
          z.object({
            field: z.string().describe('Field to filter on'),
            operator: z
              .enum([
                '==',
                '!=',
                '<',
                '<=',
                '>',
                '>=',
                'array-contains',
                'array-contains-any',
                'in',
                'not-in',
              ])
              .describe('Comparison operator'),
            value: z.any().describe('Value to compare against'),
          })
        )
        .optional()
        .default([])
        .describe('Array of filter conditions to apply (optional)'),
      orderBy: z
        .array(
          z.object({
            field: z.string().describe('Field to order by'),
            direction: z
              .enum(['asc', 'desc'])
              .default('asc')
              .describe('Sort direction (default: ascending)'),
          })
        )
        .optional()
        .default([])
        .describe('Array of fields to order results by (optional)'),
      limit: z
        .number()
        .min(1)
        .max(100)
        .default(10)
        .optional()
        .describe('Maximum number of documents to return (default: 10)'),
      startAfter: z
        .string()
        .optional()
        .describe('Document ID to start after for pagination (optional)'),
      format: z
        .enum(['full', 'summary'])
        .default('full')
        .optional()
        .describe(
          'Output format: "full" for complete document data, "summary" for IDs and selected fields only (default: full)'
        ),
      selectFields: z
        .array(z.string())
        .optional()
        .describe('Array of fields to include in summary format (only used when format="summary")'),
    }),
    execute: async ({
      collection,
      filters = [],
      orderBy = [],
      limit = 10,
      startAfter,
      format = 'full',
      selectFields,
    }: any) => {
      try {
        const db = await getFirestore();
        // Check if db initialization failed
        if ('error' in db) {
          return formatErrorResponse('initialize', db.error);
        }

        if (!collection) {
          return formatErrorResponse('executeComplexQuery', 'Collection name is required');
        }

        let query: any = db.collection(collection);

        // Apply filters
        if (filters && filters.length > 0) {
          for (const filter of filters) {
            if (filter.field && filter.operator && filter.value !== undefined) {
              try {
                query = query.where(filter.field, filter.operator, filter.value);
              } catch (filterError) {
                return formatErrorResponse(
                  'filter-application',
                  `Error applying filter on field "${filter.field}": ${
                    filterError instanceof Error ? filterError.message : String(filterError)
                  }`
                );
              }
            } else {
              return formatErrorResponse(
                'filter-validation',
                `Invalid filter: each filter must have field, operator, and value. Got: ${JSON.stringify(
                  filter
                )}`
              );
            }
          }
        }

        // Apply ordering
        if (orderBy && orderBy.length > 0) {
          for (const order of orderBy) {
            if (!order.field) {
              return formatErrorResponse(
                'orderBy-validation',
                'Each orderBy entry must have a field property'
              );
            }
            try {
              query = query.orderBy(order.field, order.direction || 'asc');
            } catch (orderError) {
              return formatErrorResponse(
                'orderBy-application',
                `Error applying orderBy on field "${order.field}": ${
                  orderError instanceof Error ? orderError.message : String(orderError)
                }`
              );
            }
          }
        }

        // Apply pagination if startAfter is provided
        if (startAfter) {
          try {
            const startDoc = await db.collection(collection).doc(startAfter).get();
            if (startDoc.exists) {
              query = query.startAfter(startDoc);
            } else {
              return formatErrorResponse(
                'pagination',
                `Document with ID "${startAfter}" not found for pagination`
              );
            }
          } catch (startAfterError) {
            return formatErrorResponse(
              'pagination',
              `Error applying startAfter with document ID "${startAfter}": ${
                startAfterError instanceof Error ? startAfterError.message : String(startAfterError)
              }`
            );
          }
        }

        // Apply limit
        query = query.limit(limit);

        // Execute query
        let querySnapshot;
        try {
          querySnapshot = await query.get();
        } catch (queryError) {
          return formatErrorResponse(
            'query-execution',
            `Error executing query: ${
              queryError instanceof Error ? queryError.message : String(queryError)
            }`
          );
        }

        if (querySnapshot.empty) {
          return `No documents found in '${collection}' matching query criteria.`;
        }

        // Format results based on format parameter
        let documents;
        try {
          if (format === 'summary') {
            documents = querySnapshot.docs.map((doc: any) => {
              const data: Record<string, any> = { id: doc.id };
              if (selectFields && selectFields.length > 0) {
                const docData = doc.data();
                for (const field of selectFields) {
                  if (field in docData) {
                    data[field] = docData[field];
                  }
                }
              }
              return data;
            });
          } else {
            documents = querySnapshot.docs.map((doc: any) => ({
              id: doc.id,
              ...doc.data(),
            }));
          }
        } catch (formatError) {
          return formatErrorResponse(
            'result-formatting',
            `Error formatting query results: ${
              formatError instanceof Error ? formatError.message : String(formatError)
            }`
          );
        }

        serverLogger.info('Firestore', 'Complex query executed successfully', {
          collection,
          count: documents.length,
          filtersCount: filters?.length || 0,
        });

        const filterDescription =
          filters && filters.length > 0 ? `with ${filters.length} filter(s)` : 'with no filters';

        return `Retrieved ${
          documents.length
        } document(s) from '${collection}' ${filterDescription}:\n\`\`\`json\n${JSON.stringify(
          documents,
          null,
          2
        )}\n\`\`\``;
      } catch (error) {
        serverLogger.error('Firestore', 'Error executing complex query', {
          error,
          collection,
          filtersCount: filters?.length || 0,
        });
        return formatErrorResponse('executeComplexQuery', error);
      }
    },
  },
};
