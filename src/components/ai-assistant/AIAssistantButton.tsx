import React, { useState } from 'react';
import { Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AIChatDialog } from './AIChatDialog';

export const AIAssistantButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="relative h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 p-0 hover:scale-110 transition-transform duration-200 shadow-lg"
        title="AI System Assistant"
      >
        <Bot className="h-5 w-5 text-white" />
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-purple-600 shadow-md">
          AI
        </span>
      </Button>

      <AIChatDialog open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
};
