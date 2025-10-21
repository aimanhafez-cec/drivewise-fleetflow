import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { X, Send, Trash2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAIAssistant } from '@/hooks/useAIAssistant';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AIChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AIChatDialog: React.FC<AIChatDialogProps> = ({ open, onOpenChange }) => {
  const { messages, isLoading, sendMessage, clearChat } = useAIAssistant();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const message = input.trim();
    setInput('');
    await sendMessage(message, location.pathname);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Context-aware quick actions based on current route
  const getQuickActions = (): string[] => {
    const path = location.pathname;

    if (path.startsWith('/dashboard')) {
      return [
        'What are the key metrics on this dashboard?',
        'How do I use the daily planner?',
        'Show me today\'s critical tasks',
        'Explain the revenue trends',
      ];
    }

    if (path.startsWith('/reservations')) {
      return [
        'How do I create a new reservation?',
        'How do I confirm a pending reservation?',
        'How do I handle reservation cancellations?',
        'How do I process down payments?',
      ];
    }

    if (path.startsWith('/agreements')) {
      return [
        'What\'s the difference between Quick and Enhanced wizard?',
        'How do I create a rental agreement?',
        'How do I extend an existing agreement?',
        'How do I handle agreement modifications?',
      ];
    }

    if (path.startsWith('/vehicles')) {
      return [
        'How do I add a new vehicle to the fleet?',
        'How do I update vehicle status?',
        'How do I track vehicle maintenance?',
        'How do I manage vehicle documents?',
      ];
    }

    if (path.startsWith('/customers')) {
      return [
        'How do I add a new customer?',
        'How do I verify customer documents?',
        'How do I view customer rental history?',
        'How do I manage corporate customers?',
      ];
    }

    if (path.startsWith('/inspections')) {
      return [
        'How do I perform a check-out inspection?',
        'How do I perform a check-in inspection?',
        'How do I document vehicle damage?',
        'How do I lock an inspection?',
      ];
    }

    if (path.startsWith('/operations')) {
      return [
        'How do I create a custody transaction?',
        'How do I record tolls and fines?',
        'How do I handle compliance exceptions?',
        'How do I manage support tickets?',
      ];
    }

    if (path.startsWith('/payments')) {
      return [
        'How do I process a payment?',
        'How do I record a down payment?',
        'How do I handle refunds?',
        'How do I generate invoices?',
      ];
    }

    if (path.startsWith('/rfqs')) {
      return [
        'How do I create a new RFQ?',
        'How do I convert an RFQ to a quotation?',
        'How do I track RFQ status?',
        'How do I manage RFQ responses?',
      ];
    }

    if (path.startsWith('/daily-planner')) {
      return [
        'How do I use the daily planner?',
        'What tasks should I prioritize today?',
        'How do I handle check-ins and check-outs?',
        'How do I manage overdue tasks?',
      ];
    }

    if (path.startsWith('/reports')) {
      return [
        'How do I generate revenue reports?',
        'How do I view utilization reports?',
        'How do I analyze customer data?',
        'How do I export reports?',
      ];
    }

    if (path.startsWith('/settings')) {
      return [
        'How do I configure instant booking settings?',
        'How do I manage price lists?',
        'How do I set up locations and branches?',
        'How do I configure tax settings?',
      ];
    }

    // Default actions for other pages
    return [
      'How do I create a new reservation?',
      'How do I perform a vehicle inspection?',
      'How do I process a payment?',
      'How do I manage customer documents?',
    ];
  };

  const quickActions = getQuickActions();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl h-[600px] flex flex-col p-0 [&>button]:hidden">
        <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <DialogTitle className="text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                AI System Assistant
              </DialogTitle>
              {location.pathname !== '/' && (
                <span className="text-xs text-white/80 font-normal">
                  📍 Context: {location.pathname.split('/')[1]?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Home'}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              {messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearChat}
                  className="h-8 w-8 text-white hover:bg-white/20"
                  title="Clear chat"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8 text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 flex flex-col overflow-hidden">
          <ScrollArea className="flex-1 px-6 py-4" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Welcome to AI Assistant</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    I'm here to help you navigate and use the car rental management system.
                  </p>
                </div>
              <div className="w-full max-w-md space-y-2">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Quick actions for {location.pathname.split('/')[1] || 'this page'}:
                  </p>
                  {quickActions.map((action, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      className="w-full justify-start text-left h-auto py-2 px-3 hover:bg-gradient-to-r hover:from-purple-50 hover:via-pink-50 hover:to-blue-50 transition-all"
                      onClick={() => {
                        setInput(action);
                        setTimeout(() => handleSend(), 100);
                      }}
                    >
                      <span className="text-sm">{action}</span>
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, idx) => (
                  <div
                    key={idx}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-lg px-4 py-2 bg-muted">
                      <div className="flex space-x-2">
                        <div className="h-2 w-2 rounded-full bg-foreground/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="h-2 w-2 rounded-full bg-foreground/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="h-2 w-2 rounded-full bg-foreground/50 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          <div className="border-t px-6 py-4">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about the system..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 hover:opacity-90"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Press Enter to send • Shift+Enter for new line
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
