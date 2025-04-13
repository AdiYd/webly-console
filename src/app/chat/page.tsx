import ChatInterface from "@/components/ai/ChatInterface";

export default function ChatPage() {
  return (
    <div className="p-4 h-auto flex flex-col">
      <h1 className="text-2xl font-bold mb-4">AI Chat Assistant</h1>
      <div className="flex-1 card bg-base-100/80 backdrop-blur-xl">
        <ChatInterface />
      </div>
    </div>
  );
}
