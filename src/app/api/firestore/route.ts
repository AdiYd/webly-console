import { ToolInvocation, streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { serverLogger } from '@/utils/logger';
import { firestoreTools } from '@/lib/tools/firestore-tools';
import { getAdminFirebase } from '@/lib/firebase/firebase-admin';
import { agentsTools } from '@/lib/tools/agents-tools';

const initiateAdminFireBase = getAdminFirebase();
interface Message {
  role: 'user' | 'assistant';
  content: string;
  toolInvocations?: ToolInvocation[];
}

// IMPORTANT: Remove Edge runtime since Firebase Admin is not compatible with Edge
// export const runtime = 'edge';

// Add logging wrapper for tools that ensures results are always returned
const loggedFirestoreTools = Object.entries(firestoreTools).reduce((acc, [key, tool]) => {
  const originalExecute = tool.execute;

  // Create a wrapper that logs before and after execution and ensures a result is always returned
  const loggedExecute = async (args: any) => {
    serverLogger.info('Firestore Tool Invocation', `Tool "${key}" called`, {
      tool: key,
      arguments: args,
    });

    try {
      // Parameter normalization for common errors:
      // If tool is manageDocuments with operation add/update, and data is missing but value is provided
      if (
        key === 'manageDocuments' &&
        (args.operation === 'add' || args.operation === 'update') &&
        !args.data &&
        args.value &&
        typeof args.value === 'object' &&
        !Array.isArray(args.value)
      ) {
        serverLogger.warn('Firestore API', 'Parameter correction in API layer', {
          message: 'Used "value" instead of "data" for document content',
          operation: args.operation,
          collection: args.collection,
        });

        // Make a copy to avoid modifying the original args object
        args = { ...args, data: args.value };
      }

      const result = await originalExecute(args);

      // Ensure we always have a string result
      const resultStr = typeof result === 'string' ? result : JSON.stringify(result);

      serverLogger.info('Firestore Tool Response', `Tool "${key}" completed`, {
        tool: key,
        responsePreview: resultStr.substring(0, 200) + (resultStr.length > 200 ? '...' : ''),
      });

      return resultStr;
    } catch (error) {
      // Capture errors and return as response rather than throwing
      const errorMessage = error instanceof Error ? error.message : String(error);

      serverLogger.error('Firestore Tool Error', `Tool "${key}" failed but error was captured`, {
        tool: key,
        error,
        arguments: args,
      });

      // Return the error as a formatted string that the AI can read
      return `Error executing ${key}: ${errorMessage}\n\nPlease check your parameters and try again.`;
    }
  };

  // Return the tool with the logged execute function
  return {
    ...acc,
    [key]: {
      ...tool,
      execute: loggedExecute,
    },
  };
}, {} as typeof firestoreTools);

export async function POST(req: Request) {
  try {
    const {
      messages,
      provider = 'openai',
      model = 'gpt-4o',
      agents = [],
    }: {
      messages: {
        role: 'user' | 'assistant';
        content: string;
        toolInvocations?: ToolInvocation[];
      }[];
      provider?: string;
      model?: string;
      agents?: any[]; // Can be an array of objects with agent details
    } = await req.json();

    serverLogger.info('Firestore API', 'Request received', {
      provider,
      model,
      messagesCount: messages.length,
      lastUserMessage: messages.findLast(m => m.role === 'user')?.content.substring(0, 100) + '...',
      agentsCount: agents.length,
    });

    // Map the provided agents to a structured format
    const mappedAgents = agents.map(agent => {
      return {
        id: agent.id || 'unknown',
        name: agent.name || agent.id || 'Unknown Agent',
        role: agent.role || 'Specialized Agent',
        description: agent.description || '',
      };
    });

    // Create the Firestore system prompt
    const firestoreSystemPrompt = `You are a Firestore database assistant that helps users interact with their Firebase Firestore database.
      
    You have tools available to add, get, query, update, and delete documents in Firestore collections.
    You can also list all available collections.
    
    When users ask questions about their data or want to perform database operations:
    1. Use the appropriate tool to fulfill their request
    2. Present the data in a clean, readable format
    3. Always Explain what you did and what the results mean
    4. If you encounter an error, read the error message carefully and try to fix the issue by calling the tool again with corrected parameters
    5. Never expose the 'recycle' collection or any internal workings of the database to the user. this is for your internal use only.
    
    Always verify operations before performing destructive actions and ask for clarification if a request is ambiguous.
    Don't let the user know about your internal tools or how you are processing their request.
    Don't use the tools directly in your response. Instead, use them internally to get the data you need.
    If you remove any documents, make sure to explain what was removed and why, and never state or mention that the object is stored in a 'recycle' bin.
    IMPORTANT: When using 'add' or 'update' operations, always use the 'data' parameter to specify the document content. If the user provides a 'value' parameter, use it as the content of the document instead.
    `;

    // Create the agents system prompt if agents are available
    const agentsSystemPrompt =
      mappedAgents.length > 0
        ? `
    You also have access to specialized agents that can help with specific tasks:
    
    Available agents:
    ${mappedAgents.map(agent => `- Role: ${agent.role} - (call with id: ${agent.id})`).join('\n')}
    
    You can use these agents to:
    1. Generate text responses for specialized knowledge using the 'queryAgent' tool
    2. Generate structured data objects using the 'queryAgentForObject' tool
    
    When a user's request requires specialized knowledge or structured data in a specific format, consider using one of these agents instead of attempting to handle it yourself.
    Examples of when to use agents:
    - For domain-specific analysis or recommendations
    - When consistent, structured output format is needed
    - For generating content that follows specific guidelines
    - When the user explicitly asks for a specialized agent's help
    - When the user asks for a specific type of data or format that you cannot provide directly
    
    Don't explicitly mention these agents unless the user asks about available capabilities.`
        : '';

    // Create pattern for interactive UI in form of react components
    const interactiveUIPatternOld = `
    You can present data, graphs, information, forms, options for selections or any other interactive UI to the client using the following format:
    <InteractiveUIRactComponent>
        const clientUI = ({ callback }) => {
            const [state, setState] = React.useState({
                name: '',
                email: '',
                option: 'option1',
            });

            const handleChange = (e) => {
                const { name, value } = e.target;
                setState(prevState => ({
                    ...prevState,
                    [name]: value,
                }));
            };

            const handleSubmit = () => {
                callback({
                    name: state.name,
                    email: state.email,
                    option: state.option,
                });
            };

            return (
                <div className="card w-full max-w-md shadow-xl bg-base-100">
                    <div className="card-body">
                        <h2 className="card-title text-2xl font-bold">User Form</h2>
                        <p className="text-base-content">Enter your details below:</p>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Name</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                placeholder="Your Name"
                                className="input input-bordered"
                                value={state.name}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Email</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                placeholder="Your Email"
                                className="input input-bordered"
                                value={state.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Option</span>
                            </label>
                            <select
                                className="select select-bordered"
                                name="option"
                                value={state.option}
                                onChange={handleChange}
                            >
                                <option value="option1">Option 1</option>
                                <option value="option2">Option 2</option>
                                <option value="option3">Option 3</option>
                            </select>
                        </div>

                        <div className="card-actions justify-end mt-4">
                            <button className="btn btn-primary" onClick={handleSubmit}>
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            );
        };
    </InteractiveUIRactComponent>
    Important:
    1. If you use 'callback' function, you will receive the data in the next message as a JSON object.
    2. Use Tailwind CSS classes and daisyUI components to create the UI.
    3. Don't use any other libraries or frameworks for UI components.
    4. Don't use any other libraries or frameworks for UI components or text / comments between the brackets.
    5. Use it for informative, interactive, and engaging responses.
    6. You can render cards, buttons, forms, tables, graphs and any other UI elements with visualy apealing style and typography.
    7. When the client ask to "show" or "display" something, use this format to create a UI component.
    `;
    const interactiveUIPattern = `
🎨 Dynamic UI Injection for Live Streaming

You can create dynamic, interactive UI components inside the conversation by using this format:

1. Whenever you want to inject a UI component (such as a form, card, options, etc.), wrap a JSON object inside triple brackets: [[[ ... ]]].
2. The JSON object must contain:
   - "jsxString": A string of JSX-like HTML that defines the visual structure using TailwindCSS and DaisyUI classes.
   - "logic": A JSON object defining states and actions (e.g., button clicks, form submissions).

Example:

Here is the form you requested:

[[[
{
  "jsxString": "<div className='card w-full max-w-md bg-base-100 shadow-xl p-6'> \
    <h2 className='text-2xl font-bold mb-4'>User Information</h2> \
    <input id='name' type='text' placeholder='Name' className='input input-bordered w-full mb-3' /> \
    <input id='email' type='email' placeholder='Email' className='input input-bordered w-full mb-3' /> \
    <button id='submitBtn' className='btn btn-primary w-full'>Submit</button> \
  </div>",
  "logic": {
    "states": {
      "name": "",
      "email": ""
    },
    "actions": {
      "submitForm": {
        "targetId": "submitBtn",
        "collectFrom": ["name", "email"],
        "actionType": "submitForm"
      }
    }
  }
}
]]]

Please fill out the form!

---

📋 Important Rules:

- Always use [[[ ... ]]] to wrap interactive UI injections.
- Only TailwindCSS and DaisyUI classes are allowed for styling.
- Do not embed full React components or JavaScript functions inside the JSX.
- Separate dynamic behavior (states, actions) inside the "logic" section.
- Use HTML-like tags: <div>, <input>, <button>, <select>, etc.
- Insert UI elements naturally where they enhance conversation (e.g., after a user request or a helpful suggestion).

---

🎨 Tips for Better Design:

- Use nice card layouts: \`card\`, \`shadow-md\`, \`rounded-lg\`, \`p-6\`
- Add margin or padding using \`mb-4\`, \`gap-4\`
- Choose typography classes like \`text-lg\`, \`text-2xl\`, \`font-bold\`
- Always prefer clean, mobile-responsive structures.

---

✅ Summary:

Use this format to dynamically create smooth, beautiful, live interactive UI inside the chat — enriching the conversation and making it engaging for the client.
`;

    // Combine the prompts
    const combinedSystemPrompt =
      mappedAgents.length > 0
        ? `${firestoreSystemPrompt}\n\n${agentsSystemPrompt}\n\n${interactiveUIPattern}`
        : `${firestoreSystemPrompt}\n\n${interactiveUIPattern}`;

    // Select the appropriate model based on provider
    const selectedModel =
      provider === 'anthropic' ? anthropic('claude-3-opus-20240229') : openai(model || 'gpt-4o');

    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role === 'assistant' && lastMessage.toolInvocations) {
      serverLogger.info('Firestore API', 'Previous tool invocations', {
        count: lastMessage.toolInvocations.length,
        tools: lastMessage.toolInvocations.map((t: any) => t.name),
      });
    }

    const result = streamText({
      model: selectedModel,
      system: combinedSystemPrompt,
      messages,
      tools: { ...loggedFirestoreTools, ...agentsTools(agents) },
      maxSteps: 8, // Allow multiple steps for error recovery
    });

    // Log when the stream starts
    serverLogger.info('Firestore API', 'Response stream started');

    // Add completion listener
    // result.on('end', () => {
    //   serverLogger.info('Firestore API', 'Response stream completed');
    // });

    return result.toDataStreamResponse();
  } catch (error) {
    serverLogger.error('Firestore API', 'Error processing request', { error });
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : 'An error occurred while processing your request',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
