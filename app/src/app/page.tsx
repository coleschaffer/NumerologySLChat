'use client';

import CosmosBackground from '@/components/Background/CosmosBackground';
import ChatContainer from '@/components/Chat/ChatContainer';
import { useConversationStore } from '@/store/conversationStore';

export default function Home() {
  // Get the user's Life Path number to personalize the cosmos
  const lifePath = useConversationStore((state) => state.userProfile.lifePath);

  return (
    <main className="h-screen w-screen overflow-hidden relative">
      <CosmosBackground personalizedNumber={lifePath} />

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#d4af37] to-[#9b59b6] flex items-center justify-center">
              <span className="text-white text-sm font-bold">✦</span>
            </div>
            <h1
              className="text-xl font-medium text-white/90 tracking-wide"
              style={{ fontFamily: 'var(--font-cinzel), serif' }}
            >
              The Oracle
            </h1>
          </div>
        </div>
      </header>

      {/* Chat area with padding for header */}
      <div className="h-full pt-16 pb-4">
        <ChatContainer />
      </div>
    </main>
  );
}
