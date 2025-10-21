import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export const useAIAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const streamChat = useCallback(async (
    userMessage: string,
    currentRoute?: string
  ) => {
    const newUserMessage: Message = { role: 'user', content: userMessage };
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    const CHAT_URL = `https://tbmcmbldoaespjlhpfys.supabase.co/functions/v1/ai-assistant-chat`;

    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRibWNtYmxkb2Flc3BqbGhwZnlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MTQzMzcsImV4cCI6MjA2OTM5MDMzN30.4uJ4xpyZENd15IPQ-ctaouZ0Q7HFNr-CsRtJ0O7bqNs`,
        },
        body: JSON.stringify({
          messages: [...messages, newUserMessage],
          currentRoute,
        }),
      });

      if (!resp.ok) {
        if (resp.status === 429) {
          toast({
            title: 'Rate Limit Exceeded',
            description: 'Too many requests. Please try again in a moment.',
            variant: 'destructive',
          });
          setMessages(prev => prev.slice(0, -1)); // Remove user message
          setIsLoading(false);
          return;
        }

        if (resp.status === 402) {
          toast({
            title: 'Payment Required',
            description: 'Please add funds to your Lovable AI workspace.',
            variant: 'destructive',
          });
          setMessages(prev => prev.slice(0, -1)); // Remove user message
          setIsLoading(false);
          return;
        }

        throw new Error('Failed to start stream');
      }

      if (!resp.body) {
        throw new Error('No response body');
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let streamDone = false;
      let assistantContent = '';

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        // Process line-by-line as data arrives
        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            
            if (content) {
              assistantContent += content;
              
              // Update or create assistant message
              setMessages(prev => {
                const lastMessage = prev[prev.length - 1];
                if (lastMessage?.role === 'assistant') {
                  // Update existing assistant message
                  return prev.map((msg, idx) =>
                    idx === prev.length - 1
                      ? { ...msg, content: assistantContent }
                      : msg
                  );
                } else {
                  // Create new assistant message
                  return [...prev, { role: 'assistant', content: assistantContent }];
                }
              });
            }
          } catch (parseError) {
            // Incomplete JSON, put it back and wait for more data
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Final flush for any remaining buffered lines
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split('\n')) {
          if (!raw) continue;
          if (raw.endsWith('\r')) raw = raw.slice(0, -1);
          if (raw.startsWith(':') || raw.trim() === '') continue;
          if (!raw.startsWith('data: ')) continue;
          
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const lastMessage = prev[prev.length - 1];
                if (lastMessage?.role === 'assistant') {
                  return prev.map((msg, idx) =>
                    idx === prev.length - 1
                      ? { ...msg, content: assistantContent }
                      : msg
                  );
                } else {
                  return [...prev, { role: 'assistant', content: assistantContent }];
                }
              });
            }
          } catch {
            // Ignore partial leftovers
          }
        }
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: 'Error',
        description: 'Failed to get response from AI assistant. Please try again.',
        variant: 'destructive',
      });
      setMessages(prev => prev.slice(0, -1)); // Remove user message on error
      setIsLoading(false);
    }
  }, [messages, toast]);

  const clearChat = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage: streamChat,
    clearChat,
  };
};
