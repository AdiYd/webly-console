import ChatInterface from "@/components/ai/ChatInterface";

export default function ChatPage() {
  return (
    <main className="container mx-auto p-4 h-screen flex flex-col">
      <h1 className="text-2xl font-bold mb-4">AI Chat Assistant</h1>
      <div className="flex-1 border rounded-lg overflow-hidden bg-base-100">
        <ChatInterface />
      </div>
    </main>
  );
}