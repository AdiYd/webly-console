'use client';

import { useState, FormEvent, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { Icon } from '@iconify/react';
import { useSession } from 'next-auth/react';
import '@/globals.css';
import { AnimatePresence, motion } from 'framer-motion';
import useBoolean from '@/hooks/use-boolean';
import { clientLogger } from '@/utils/logger';
import { getRandomTheme, useTheme } from '@/context/theme-provider';

// Type definitions
interface ChatInterfaceProps {
  initialMessages?: any[];
  isMinimized?: boolean;
  projectId?: string;
  sessionId?: string;
}

declare global {
  interface Window {
    MathJax: any;
  }
}

const htmlExample = `
<!DOCTYPE html>
<html lang="en" data-theme="emerald">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Modern Web Page with DaisyUI & Tailwind CSS</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/daisyui@4.10.2/dist/full.min.css" rel="stylesheet" type="text/css" />
    <style>
        /* Custom styles for the Inter font */
        body {
            font-family: 'Inter', sans-serif;
        }
    </style>
</head>
<body class="bg-base-200 text-base-content min-h-screen flex flex-col">

    <div class="navbar bg-base-100 shadow-lg rounded-b-xl px-4 py-3">
        <div class="flex-1">
            <a class="btn btn-ghost text-xl font-bold text-primary" href="#">
                My Awesome App
            </a>
        </div>
        <div class="flex-none">
            <ul class="menu menu-horizontal px-1">
                <li><a class="font-medium rounded-lg hover:bg-primary hover:text-primary-content transition-colors duration-200">Home</a></li>
                <li><a class="font-medium rounded-lg hover:bg-primary hover:text-primary-content transition-colors duration-200">Features</a></li>
                <li><a class="font-medium rounded-lg hover:bg-primary hover:text-primary-content transition-colors duration-200">About</a></li>
                <li><a class="font-medium rounded-lg hover:bg-primary hover:text-primary-content transition-colors duration-200">Contact</a></li>
            </ul>
        </div>
    </div>

    <main class="flex-grow container mx-auto p-4 md:p-8 flex flex-col items-center justify-center">
        <div class="text-center py-16 px-4 max-w-4xl">
            <h1 class="text-5xl md:text-6xl font-extrabold text-primary mb-6 leading-tight">
                Build Beautiful UIs, Effortlessly.
            </h1>
            <p class="text-lg md:text-xl text-base-content/80 mb-8 max-w-2xl mx-auto">
                Leverage the power of Tailwind CSS and DaisyUI to create stunning, responsive web applications with minimal effort.
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
                <button class="btn btn-primary btn-lg rounded-full shadow-lg hover:scale-105 transition-transform duration-300">
                    Get Started
                </button>
                <button class="btn btn-outline btn-lg rounded-full shadow-lg hover:bg-base-300 hover:scale-105 transition-transform duration-300">
                    Learn More
                </button>
            </div>
        </div>

        <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl mt-12">
            <div class="card bg-base-100 shadow-xl rounded-xl p-6 hover:shadow-2xl transition-shadow duration-300">
                <figure class="mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-secondary mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 17L9.75 12C9.75 11.2044 10.0661 10.4413 10.6289 9.87847C11.1918 9.31561 11.9549 9 12.75 9H14.25C15.0451 9 15.8082 9.31561 16.3711 9.87847C16.9339 10.4413 17.25 11.2044 17.25 12V17M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" />
                    </svg>
                </figure>
                <div class="card-body p-0 text-center">
                    <h2 class="card-title text-2xl font-semibold text-primary mb-3 justify-center">Responsive by Design</h2>
                    <p class="text-base-content/70">
                        Craft layouts that look amazing on any device, from mobile phones to large desktop monitors, without extra effort.
                    </p>
                </div>
            </div>

            <div class="card bg-base-100 shadow-xl rounded-xl p-6 hover:shadow-2xl transition-shadow duration-300">
                <figure class="mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-accent mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </figure>
                <div class="card-body p-0 text-center">
                    <h2 class="card-title text-2xl font-semibold text-primary mb-3 justify-center">Configurable Themes</h2>
                    <p class="text-base-content/70">
                        Easily switch between various themes or customize your own to match your brand's aesthetic perfectly.
                    </p>
                </div>
            </div>

            <div class="card bg-base-100 shadow-xl rounded-xl p-6 hover:shadow-2xl transition-shadow duration-300">
                <figure class="mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-info mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                </figure>
                <div class="card-body p-0 text-center">
                    <h2 class="card-title text-2xl font-semibold text-primary mb-3 justify-center">Rapid Development</h2>
                    <p class="text-base-content/70">
                        Accelerate your development workflow with pre-built components and utility-first CSS, saving valuable time.
                    </p>
                </div>
            </div>
        </section>

        <section class="bg-primary text-primary-content rounded-2xl shadow-xl p-8 md:p-12 mt-16 w-full max-w-4xl text-center">
            <h2 class="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Design?</h2>
            <p class="text-lg mb-8 opacity-90">
                Join thousands of developers building amazing things with DaisyUI and Tailwind CSS today.
            </p>
            <button class="btn btn-secondary btn-lg rounded-full shadow-lg hover:scale-105 transition-transform duration-300">
                Sign Up Now
            </button>
        </section>
    </main>

    <footer class="footer footer-center p-8 bg-base-300 text-base-content rounded-t-xl shadow-inner mt-12">
        <aside>
            <p class="font-bold text-lg">
                My Awesome App <br/>Providing reliable services since 2023
            </p>
            <p class="text-sm opacity-80">
                Copyright © 2023 - All right reserved
            </p>
        </aside>
        <nav>
            <div class="grid grid-flow-col gap-4">
                <a class="link link-hover">About us</a>
                <a class="link link-hover">Contact</a>
                <a class="link link-hover">Jobs</a>
                <a class="link link-hover">Press kit</a>
            </div>
        </nav>
    </footer>

</body>
</html>
`;

const uiDocumentWrapper = (uiElement: string, theme = 'autumn') => `
  <!DOCTYPE html>
<html lang="en" data-theme="${theme}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Modern Web Page with DaisyUI & Tailwind CSS</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/daisyui@4.10.2/dist/full.min.css" rel="stylesheet" type="text/css" />
    <script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"></script>
    <script src="https://cdn.plot.ly/plotly-3.0.1.min.js" charset="utf-8"></script>     <!-- MathJax CDN -->
    <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
    <script>
      // MathJax configuration (optional)
      window.MathJax = {
        tex: {
          inlineMath: [['\\\\(', '\\\\)']],
          displayMath: [['\\\\(', '\\\\)']],
          processEscapes: true
        },
        options: {
          skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre']
        }
      };
    </script>
    
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background-color: transparent;
        }
        ui {
            display: block;
            margin: 0;
            padding: 0;
        }
    </style>
</head>
<body class="bg-base-200 text-base-content min-h-screen flex flex-col">

    <main class="flex-grow container mx-auto !p-2 md:!p-4 flex flex-col items-center justify-center">
       ${uiElement}
    </main>

    <script>
        // JavaScript to handle form submission and send data to parent
        document.addEventListener('DOMContentLoaded', () => {
            const form = document.getElementById('myForm');
            const formStatus = document.getElementById('formStatus');

            if (form) {
                form.addEventListener('submit', (event) => {
                    event.preventDefault(); // Prevent default form submission

                    // Collect form data
                    const formData = new FormData(form);
                    const data = {};
                    for (let [key, value] of formData.entries()) {
                        data[key] = value;
                    }

                    // Send data to the parent window using postMessage
                    // The second argument '*' means any origin can receive the message.
                    // For production, always specify the targetOrigin (e.g., 'https://yourparentdomain.com')
                    // to prevent data leakage to malicious sites.
                    window.parent.postMessage({
                        type: 'formSubmission',
                        payload: data
                    }, '*');

                    // Provide feedback to the user inside the iframe
                    formStatus.textContent = 'Form submitted! Data sent to parent.';
                    form.reset(); // Optionally reset the form
                });
            }
        });
    </script>

</body>
</html>`;

// Example chat data for initial state
const exampleChat = [
  {
    role: 'assistant',
    content: 'Hello! How can I assist you today?',
    id: '1',
  },
  {
    role: 'user',
    content:
      "Write me nice html document using tailwindcss and daisyui components, don't forget to use CDN links for tailwindcss and daisyui",
    id: '2',
  },
  {
    role: 'assistant',
    content: `Sure! Here's a simple HTML document that uses Tailwind CSS and DaisyUI components:
    \n
    \`\`\`html${htmlExample}\`\`\``,
    id: '3',
  },
  {
    role: 'user',
    content: 'Create a contact form UI component with validation and submission handling',
    id: '4',
  },
  {
    role: 'assistant',
    content: `I'd be happy to create a contact form UI component for you. Here's a professional contact form with validation and submission handling:
    
    \`\`\`UI
    <section id="country-graphs" class="ui">
  <div class="card bg-base-100 shadow-sm">
    <div class="card-body p-4">
      <h3 class="card-title text-base font-medium">Country Comparison Graphs</h3>
      <p class="text-sm text-base-content/70 mb-3">Visual representation of key metrics for influential countries.</p>

      <!-- Plotly Graph Containers -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="card bg-base-200 shadow-sm">
          <div class="card-body">
            <h4 class="font-medium text-sm">GDP Comparison</h4>
            <div id="gdpChart" class="h-64 w-full"></div>
          </div>
        </div>

        <div class="card bg-base-200 shadow-sm">
          <div class="card-body">
            <h4 class="font-medium text-sm">Population Growth</h4>
            <div id="populationChart" class="h-64 w-full"></div>
          </div>
        </div>

        <div class="card bg-base-200 shadow-sm">
          <div class="card-body">
            <h4 class="font-medium text-sm">Export and Import Values</h4>
            <div id="tradeChart" class="h-64 w-full"></div>
          </div>
        </div>

        <div class="card bg-base-200 shadow-sm">
          <div class="card-body">
            <h4 class="font-medium text-sm">Internet Usage</h4>
            <div id="internetUsageChart" class="h-64 w-full"></div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    document.addEventListener('DOMContentLoaded', function() {
      // GDP Comparison - Bar Chart
      Plotly.newPlot('gdpChart', [{
        x: ['USA', 'China', 'India', 'Germany'],
        y: [21, 14, 2.9, 3.8],
        type: 'bar',
        marker: {
          color: 'hsl(var(--p))'
        }
      }], {
        margin: { t: 10, r: 10, l: 40, b: 40 },
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
        font: { family: 'Inter, sans-serif', size: 10 },
        xaxis: { fixedrange: true },
        yaxis: { title: 'GDP in Trillions', fixedrange: true }
      }, {responsive: true});

      // Population Growth - Line Chart
      Plotly.newPlot('populationChart', [{
        x: ['2010', '2015', '2020', '2025'],
        y: [6.9, 7.3, 7.8, 8.2],
        type: 'scatter',
        mode: 'lines+markers',
        line: {
          color: 'hsl(var(--s))',
          width: 2
        }
      }], {
        margin: { t: 10, r: 10, l: 40, b: 40 },
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
        font: { family: 'Inter, sans-serif', size: 10 },
        xaxis: { fixedrange: true },
        yaxis: { title: 'Population (Billions)', fixedrange: true }
      }, {responsive: true});

      // Trade Values - Pie Chart
      Plotly.newPlot('tradeChart', [{
        values: [15, 12],
        labels: ['Exports', 'Imports'],
        type: 'pie',
        marker: {
          colors: ['hsl(var(--in))', 'hsl(var(--wa))']
        },
        textinfo: 'label+percent'
      }], {
        margin: { t: 10, r: 10, l: 10, b: 10 },
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
        font: { family: 'Inter, sans-serif', size: 10 },
        showlegend: false
      }, {responsive: true});

      // Internet Usage - Radar Chart (Plotly uses 'scatterpolar' for radar charts)
      Plotly.newPlot('internetUsageChart', [{
        type: 'scatterpolar',
        r: [300, 800, 600, 89],
        theta: ['USA', 'China', 'India', 'Germany'],
        fill: 'toself',
        fillcolor: 'rgba(var(--a), 0.2)',
        line: {
          color: 'hsl(var(--a))'
        }
      }], {
        margin: { t: 10, r: 10, l: 10, b: 10 },
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
        font: { family: 'Inter, sans-serif', size: 10 },
        polar: {
          radialaxis: {
            visible: true,
            range: [0, 900],
            title: { text: 'Internet Users (Millions)', font: { size: 8 } }
          }
        }
      }, {responsive: true});
    });
  </script>
</section>
    \`\`\`
`,
    id: '5',
  },
];

export default function ChatInterface({ initialMessages, isMinimized = false }: ChatInterfaceProps) {
  // UI state management
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<'openai' | 'anthropic'>('openai');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [uiData, setUIdata] = useState<any | null>(null);
  const [inputHistory, setInputHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [tempInput, setTempInput] = useState<string>('');

  // References
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: session } = useSession();

  // User information
  const userImage = session?.user?.image || 'https://i.pravatar.cc/150?img=3';
  const userName = session?.user?.name || 'User';

  // Initialize chat with the useChat hook
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: handleChatSubmit,
    status,
    error: chatError,
    setInput,
    setMessages,
  } = useChat({
    api: '/api/ai/chat',
    initialMessages: initialMessages,
    body: {
      provider,
      uiData,
      temperature: 0.7,
    },
    onFinish: () => {
      setUIdata(null);
    },
  });

  // Track loading state
  const isLoading = status === 'submitted' || status === 'streaming';

  // Effect: Handle input history navigation with keyboard shortcuts
  useEffect(() => {
    // Event handler for history navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if textarea is focused
      if (document.activeElement !== textareaRef.current) return;

      if (
        (e.key === 'ArrowUp' && e.ctrlKey) ||
        (e.key === 'ArrowUp' &&
          textareaRef.current === document.activeElement &&
          (input === '' || inputHistory.includes(input)))
      ) {
        e.preventDefault();
        navigateHistory('up');
      } else if (
        (e.key === 'ArrowDown' && e.ctrlKey) ||
        (e.key === 'ArrowDown' &&
          textareaRef.current === document.activeElement &&
          (input === '' || inputHistory.includes(input)))
      ) {
        e.preventDefault();
        navigateHistory('down');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [inputHistory, historyIndex, input]);

  /**
   * Navigate through input history
   */
  const navigateHistory = (direction: 'up' | 'down') => {
    if (inputHistory.length === 0) return;
    if (direction === 'up') {
      if (historyIndex === -1) {
        // Starting history navigation, save current input
        setTempInput(input);
        const newIndex = inputHistory.length - 1;
        setHistoryIndex(newIndex);
        setInput(inputHistory[newIndex]);
      } else if (historyIndex > 0) {
        // Navigate to previous item
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(inputHistory[newIndex]);
      }
    } else if (direction === 'down') {
      if (historyIndex === -1) return; // No history navigation active

      if (historyIndex < inputHistory.length - 1) {
        // Navigate to next item
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(inputHistory[newIndex]);
      } else {
        // Return to current input
        setHistoryIndex(-1);
        setInput(tempInput);
      }
    }
  };

  // Effect: Focus on input when ready
  useEffect(() => {
    if (['ready', 'error'].includes(status) && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [status]);

  // Effect: Handle chat errors
  useEffect(() => {
    if (chatError) {
      console.error('Chat error from hook:', chatError);
      try {
        setError(JSON.parse(chatError.message).error || 'An error occurred');
      } catch (e) {
        setError(chatError.message || 'An error occurred');
      }
    } else {
      setError(null);
    }
  }, [chatError]);

  // Effect: Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /**
   * Custom submit handler for sending messages
   */
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Add to history only if it's different from the last entry and not empty
    if (
      input.trim() &&
      (inputHistory.length === 0 || inputHistory[inputHistory.length - 1] !== input.trim())
    ) {
      setInputHistory(prev => {
        const newHistory = [...prev, input.trim()];
        // Keep only last 8 entries
        return newHistory.slice(-8);
      });
    }

    // Reset history navigation state
    setHistoryIndex(-1);
    setTempInput('');
    handleChatSubmit(e);
  };

  /**
   * Renders the empty state when no messages exist
   */
  const renderEmptyState = () => (
    <div className="flex flex-col pt-12 items-center justify-center text-base-content/60">
      <div className="mask mask-hexagon-2 circle-bg h-8 mb-4" />
      <p className="text-lg font-medium">Start a conversation with the AI</p>
    </div>
  );

  /**
   * Renders a message bubble
   */
  const renderMessage = (message: any, index: number) => {
    const isUser = message.role === 'user';
    let content = '';

    // Handle different message content formats
    if (typeof message.content === 'string') {
      content = message.content;
    } else if (Array.isArray(message.content)) {
      content = message.content
        .filter((part: any) => part.type === 'text')
        .map((part: any) => part.text)
        .join('\n');
    } else if (typeof message === 'string') {
      content = message;
    }

    return (
      <div
        key={message.id || `msg-${index}`}
        className={`chat ${isUser ? 'chat-end' : 'chat-start'}`}
      >
        <div className="chat-image avatar">
          <div className="w-10 rounded-full">
            {isUser ? (
              <img src={userImage} />
            ) : (
              <div className="bg-primary flex items-center justify-center h-full">
                <div className="circle-bg" />
              </div>
              // <div
              //   style={{ animationDuration: '10s' }}
              //   id="animated-blur-radial-gradient"
              //   className="w-10 h-10 rounded-full animate-spin"
              // >
              //   <div
              //     style={{
              //       animationDuration: '2s',
              //       animationDirection: 'alternate-reverse',
              //       animationDelay: '0s',
              //     }}
              //     className="w-10 h-10 rounded-full blur-[4px] bg-primary bg-gradient-to-r from-primary from-[10%] via-accent to-secondary animate-pulse* "
              //   />
              // </div>
            )}
          </div>
        </div>
        <div className="chat-header">{isUser ? userName : 'AI Assistant'}</div>
        <div
          className={`chat-bubble ${isUser ? 'chat-bubble-primary' : ''} ${
            isExpanded ? 'w-full' : 'w-fit'
          } transition-[width] duration-300 ease-in-out`}
        >
          <FormatMessageContent
            key={message.id || `msg-content-${index}`}
            content={content || null}
            isExpanded={isExpanded || false}
            setIsExpanded={setIsExpanded}
            setUIdata={setUIdata}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col bg-base-100 justify-between h-full w-full">
      {/* Messages area */}
      <div
        className={`flex-1 mt-8 overflow-y-auto max-h-[fill-available] p-4 md:px-6 ${
          isMinimized ? '!px-3' : ''
        } space-y-4`}
      >
        {messages.length === 0
          ? renderEmptyState()
          : messages.map((message, index) => renderMessage(message, index))}

        {error && !isLoading && (
          <div className="alert alert-error w-fit ml-12 shadow-lg mt-2">
            <Icon icon="carbon:warning" className="w-6 h-6" />
            <span>{error}</span>
            <button className="btn btn-sm btn-ghost" onClick={() => setError(null)}>
              <Icon icon="carbon:close" className="w-4 h-4" />
              Close
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <form
        onSubmit={handleSubmit}
        className={`${isMinimized ? 'p-2' : 'p-4'} max-sm:p-2 pt-0 max-w-[1200px] w-full mx-auto`}
      >
        <div
          className="card hover:!border-base-content/50 border-[0.9px] border-base-content/30 !bg-base-300 flex flex-col my-4 mx-2 max-sm:m-0 rounded-xl"
          onClick={() => textareaRef.current?.focus()}
        >
          <div className="flex justify-between items-center min-h-[60px] max-h-[200px] p-3">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              placeholder="Type your message here... (Ctrl+↑/↓ for history)"
              className="w-full resize-none bg-transparent focus:outline-none mr-2 overflow-y-auto"
              maxLength={2000}
              disabled={isLoading}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e as any);
                }
              }}
            />
            <button
              type="submit"
              className="btn btn-sm btn-primary btn-square"
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <Icon icon="carbon:send" className="w-5 h-5" />
              )}
            </button>
          </div>

          <div className="flex justify-between items-center px-3 pb-1 border-base-300">
            <div className="flex items-center gap-4">
              <span className="text-xs text-base-content/60">({2000 - input.length})</span>
              {uiData && (
                <div
                  title="UI data included in the message"
                  className="badge cursor-default glass badge-md hover:bg-gradient-to-r hover:from-primary/80 hover:via-secondary/80 hover:to-accent/80"
                >
                  UI form included
                </div>
              )}
              {/* {inputHistory.length > 0 && (
                <span className="text-xs text-base-content/40">
                  • {inputHistory.length}/8 history
                </span>
              )} */}
            </div>

            <div className="flex items-center gap-1 space-x-2">
              <div
                onClick={() => setProvider('openai')}
                title="Openai"
                className={`cursor-pointer hover:bg-zinc-400/40 rounded-md p-[2px] ${
                  provider === 'openai' ? 'bg-primary/20' : ''
                }`}
              >
                <Icon className="" icon="ri:openai-fill" width="1em" height="1em" />
              </div>
              <div
                onClick={() => setProvider('anthropic')}
                title="Anthropic"
                className={`cursor-pointer hover:bg-zinc-400/40 rounded-md p-[2px] ${
                  provider === 'anthropic' ? 'bg-primary/20' : ''
                }`}
              >
                <Icon className="" icon="bi:anthropic" width="1em" height="1em" />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

/**
 * Validates HTML content to have proper tags and structure and to prevent XSS attacks
 */
const validateHtml = (html: string): boolean => {
  // 1. Basic length and content check
  if (!html || html.trim().length === 0) {
    // console.warn('Validation failed: HTML string is empty or whitespace only.');
    return false;
  }

  // 2. Check for common structural elements (case-insensitive)
  // We're looking for at least <html>, <head>, and <body> tags.
  // These are fundamental for a well-formed HTML document.
  const hasHtmlTag = /<html[\s>]/i.test(html);
  const hasHeadTag = /<head[\s>]/i.test(html);
  const hasBodyTag = /<body[\s>]/i.test(html);

  if (!hasHtmlTag || !hasHeadTag || !hasBodyTag) {
    console.warn(
      'Validation failed: Missing fundamental HTML structural tags (<html>, <head>, <body>).'
    );
    return false;
  }

  // 3. Optional: Check for doctype declaration (good practice, though iframes are forgiving)
  // This ensures it's a valid HTML5 document.
  const hasDoctype = /<!DOCTYPE html>/i.test(html.trim().substring(0, 100)); // Check at the beginning

  if (!hasDoctype) {
    // console.warn(
    //   'Validation warning: Missing <!DOCTYPE html> declaration. Consider adding for best practice.'
    // );
    // return false; // You might make this a warning, not a hard fail, depending on your strictness
  }

  // 4. Sanitize potentially harmful tags/attributes (Crucial for iframe security)
  // This is a *basic* example. For real-world applications, you'd use a dedicated
  // DOMPurify library or a robust server-side sanitizer.
  // This client-side check is more for structural validity, not full security.
  const hasScriptTags = /<script[\s\S]*?>[\s\S]*?<\/script>/i.test(html);
  const hasEventAttributes =
    /on(click|load|error|submit|mouseover|key|focus|blur|change)\s*=/i.test(html);

  if (hasScriptTags || hasEventAttributes) {
    // console.warn(
    //   'Validation warning: Potential unsafe content (script tags or event attributes) detected. Consider sanitization.'
    // );
    // return false; // You might return false here for strict security, or sanitize it.
  }

  // 5. DOM parsing check (as you had, but with more context)
  // Using DOMParser is generally safer and more accurate than tempDiv.innerHTML
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Check for parsing errors
    const parserError = doc.querySelector('parsererror');
    if (parserError) {
      console.warn(
        'Validation failed: HTML parsing error detected by DOMParser.',
        parserError.textContent
      );
      return false;
    }

    // Check if the parsed document has a root html element
    if (!doc.documentElement || doc.documentElement.tagName.toLowerCase() !== 'html') {
      console.warn('Validation failed: Parsed document does not have a valid <html> root.');
      return false;
    }

    // You can add more checks on `doc` here, e.g.,
    // - Check for specific required elements inside head/body
    // - Ensure no broken image links if crucial (though this is more content validation)
  } catch (e) {
    // console.error('Validation failed: Error during DOM parsing.', e);
    return false;
  }

  // If all checks pass
  // console.log('Validation passed: HTML seems appropriate for iframe rendering.');
  return true;
};

/**
 * Formats message content with proper handling of code blocks
 */
const FormatMessageContent = ({
  content,
  isExpanded = false,
  setIsExpanded,
  setUIdata,
}: {
  content: string | null;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  setUIdata: (data: any) => void;
}) => {
  if (!content) return null;
  const [isCopied, setIsCopied] = useState(false);
  const [showHtmlPreview, setShowHtmlPreview] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const theme = useRef<string>(getRandomTheme());
  const update = useBoolean(false);

  // Effect to listen for messages from the iframe (form submissions)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Check if the message is a form submission or website submission
      if (
        event.data &&
        (event.data.type === 'formSubmission' || event.data.type === 'websiteSubmission')
      ) {
        console.log(`${event.data.type} received:`, event.data.payload);
        // Handle the form submission data
        const payload = event.data.payload;
        setUIdata(payload); // Update the UI data state with the received payload
      }
    };

    // Add event listener
    window.addEventListener('message', handleMessage);

    // Clean up
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  useEffect(() => {
    update.toggle();
  }, [showHtmlPreview, isExpanded]);

  // Effect to process MathJax after rendering
  useEffect(() => {
    if (contentRef.current && typeof window !== 'undefined' && window.MathJax) {
      // Use setTimeout to ensure DOM is fully updated
      setTimeout(() => {
        try {
          window.MathJax.typesetPromise([contentRef.current]).catch((err: any) => {
            console.error('MathJax typesetting failed:', err);
          });
        } catch (err) {
          console.error('Error calling MathJax:', err);
        }
      }, 100);
    }
  }, [content, showHtmlPreview]);

  // Split the message by common code block markers
  const parts = content.split(/(```[\s\S]*?```|`[\s\S]*?`)/g);

  return parts.map((part, i) => {
    // Check if this part is a code block
    if (part.startsWith('```') && part.endsWith('```')) {
      const code = part.substring(3, part.length - 3);
      const languageMatch = code.match(/^[a-zA-Z0-9_+-]+/);
      const language = languageMatch ? languageMatch[0].trim() : '';
      let codeContent = language ? code.substring(language.length).trim() : code;
      let isValidHtml, isUI;
      if (language === 'UI') {
        // clientLogger.info('UI_AI', 'Rendering UI Document');
        if (!showHtmlPreview && process.env.NODE_ENV === 'production') {
          setShowHtmlPreview(true);
          // setIsExpanded(true);
        }
        isUI = true;
        isValidHtml = validateHtml(uiDocumentWrapper(codeContent));
        codeContent = uiDocumentWrapper(codeContent, theme.current);
      } else {
        isValidHtml = validateHtml(codeContent);
      }

      return (
        <pre
          key={i}
          className="!text-gray-100 card !bg-zinc-800 p-3 overflow-x-auto text-sm my-2 w-fit*"
        >
          <div className="text-xs items-center flex justify-between mb-1">
            {language && (
              <div className="flex items-center gap-2">
                {isUI ? (
                  <div
                    id="heart"
                    className="h-3 w-3 bg-gradient-to-r from-primary to-secondary mask mask-heart"
                  />
                ) : (
                  <div
                    id="star"
                    className="h-3 w-3 bg-gradient-to-b from-yellow-500 via-amber-500 to-orange-500 mask mask-star-2"
                  />
                )}

                <div className="">{language}</div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <div
                onClick={() => {
                  navigator.clipboard.writeText(codeContent);
                  setIsCopied(true);
                }}
                style={{ display: isUI && process.env.NODE_ENV === 'production' ? 'none' : 'flex' }}
                className={`flex cursor-pointer hover:text-accent ${
                  isCopied ? 'text-success' : ''
                }`}
                id="copy-text"
              >
                <Icon
                  icon={isCopied ? 'mynaui:check' : 'solar:copy-linear'}
                  width="1.5em"
                  height="1.5em"
                />{' '}
              </div>
              {isValidHtml && (
                <div className="flex items-center gap-1">
                  {showHtmlPreview && (
                    <div
                      onClick={() => setIsExpanded(!isExpanded)}
                      id="expand"
                      title={isExpanded ? 'Minimize' : 'Expand'}
                      className="flex cursor-pointer hover:text-secondary/80 transition-colors"
                    >
                      <Icon
                        icon={isExpanded ? 'majesticons:minimize-line' : 'eva:expand-fill'}
                        width="1.5em"
                        height="1.5em"
                      />
                    </div>
                  )}
                  <div
                    title={showHtmlPreview ? 'Switch to code view' : 'Switch to preview'}
                    onClick={() => setShowHtmlPreview(!showHtmlPreview)}
                    style={{
                      display: isUI && process.env.NODE_ENV === 'production' ? 'none' : 'flex',
                    }}
                    className="flex cursor-pointer hover:text-primary/80 transition-colors"
                  >
                    <Icon
                      icon={
                        showHtmlPreview ? 'mingcute:code-line' : 'qlementine-icons:file-html-16'
                      }
                      width="1.5em"
                      height="1.5em"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          <AnimatePresence>
            {(isValidHtml && showHtmlPreview) || (isUI && process.env.NODE_ENV === 'production') ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <iframe
                  ref={iframeRef}
                  srcDoc={codeContent}
                  className="w-full border-0 bg-transparent rounded-lg transition-[height]"
                  style={{
                    minHeight: isExpanded ? '500px' : isUI ? '500px' : '350px',
                  }}
                  title="HTML Preview"
                  sandbox="allow-forms allow-scripts allow-same-origin"
                />
              </motion.div>
            ) : (
              <code>{codeContent}</code>
            )}
          </AnimatePresence>
        </pre>
      );
    }
    // Check if this part is an inline code snippet
    else if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="text-neutral-content card !bg-zinc-800 px-1 rounded w-fit">
          {part.substring(1, part.length - 1)}
        </code>
      );
    }

    // Check if this a start of a new code block or snippet and show loader
    else if (part.startsWith('```') || part.startsWith('`')) {
      // This is a code block or inline code, but not a complete one
      return (
        <div key={i} className="p-4 flex items-center justify-center min-h-24">
          <div className="card p-2 shadow-lg">
            <span className="loading loading-spinner loading-xs"></span>
          </div>
        </div>
      );
    }
    // Regular text content
    else if (part.trim()) {
      // Preserve line breaks in normal text
      const lines = part.split('\n');
      return (
        <span key={i} className="whitespace-pre-wrap">
          {lines.map((line, j) => (
            <span key={j}>
              {line}
              {j < lines.length - 1 && <br />}
            </span>
          ))}
        </span>
      );
    }
    return null;
  });
};