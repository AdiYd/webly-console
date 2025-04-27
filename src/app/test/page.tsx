import FirestoreChat from './firestorechat/firbasechat';
import { Icon } from '@iconify/react';

export default function FirestorePage() {
  return (
    <div className="container mx-auto p-4 h-[calc(100vh-4rem)]">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        <div className="lg:col-span-2 h-full">
          <div className="card bg-base-100 shadow-xl h-full">
            <div className="card-body">
              <h2 className="card-title">Firestore Data Explorer</h2>
              <p className="text-base-content/70">
                Ask the AI assistant to help you manage your Firestore database using natural
                language. The assistant uses specialized tools to interact with your database.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                <div className="card bg-base-200 p-4">
                  <h3 className="font-medium mb-2 flex items-center">
                    <Icon icon="carbon:add" className="w-5 h-5 mr-2 text-success" />
                    Add Documents
                  </h3>
                  <p className="text-sm">
                    Create new documents in your collections with custom fields and values.
                  </p>
                  <div className="mt-2">
                    <code className="text-xs block bg-base-300 p-2 rounded">
                      Add a user to the users collection with name John Doe and email
                      john@example.com
                    </code>
                  </div>
                </div>
                <div className="card bg-base-200 p-4">
                  <h3 className="font-medium mb-2 flex items-center">
                    <Icon icon="carbon:search" className="w-5 h-5 mr-2 text-info" />
                    Query Data
                  </h3>
                  <p className="text-sm">Search for documents using field conditions and limits.</p>
                  <div className="mt-2">
                    <code className="text-xs block bg-base-300 p-2 rounded">
                      Find all users where age is greater than 25
                    </code>
                  </div>
                </div>
                <div className="card bg-base-200 p-4">
                  <h3 className="font-medium mb-2 flex items-center">
                    <Icon icon="carbon:edit" className="w-5 h-5 mr-2 text-warning" />
                    Update Documents
                  </h3>
                  <p className="text-sm">Modify existing documents by updating specific fields.</p>
                  <div className="mt-2">
                    <code className="text-xs block bg-base-300 p-2 rounded">
                      Update user ABC123 to change status to active
                    </code>
                  </div>
                </div>
                <div className="card bg-base-200 p-4">
                  <h3 className="font-medium mb-2 flex items-center">
                    <Icon icon="carbon:trash-can" className="w-5 h-5 mr-2 text-error" />
                    Delete Documents
                  </h3>
                  <p className="text-sm">
                    Remove documents from your collections when they're no longer needed.
                  </p>
                  <div className="mt-2">
                    <code className="text-xs block bg-base-300 p-2 rounded">
                      Delete the product with ID XYZ789
                    </code>
                  </div>
                </div>
              </div>

              <div className="divider">Advanced Examples</div>

              <div className="grid grid-cols-1 gap-4">
                <div className="card bg-base-200 p-4">
                  <h3 className="font-medium mb-2 flex items-center">
                    <Icon icon="carbon:list" className="w-5 h-5 mr-2 text-primary" />
                    List Collections
                  </h3>
                  <p className="text-sm">View all collections in your Firestore database.</p>
                  <div className="mt-2">
                    <code className="text-xs block bg-base-300 p-2 rounded">
                      Show me all collections in the database
                    </code>
                  </div>
                </div>
                <div className="alert alert-info">
                  <Icon icon="carbon:information" className="w-6 h-6" />
                  <div>
                    <span className="font-medium">Try natural language queries:</span>
                    <p className="text-sm mt-1">
                      "Create a new product with name 'Premium Widget', price 49.99, and category
                      'Electronics'"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="h-full">
          <FirestoreChat />
        </div>
      </div>
    </div>
  );
}
