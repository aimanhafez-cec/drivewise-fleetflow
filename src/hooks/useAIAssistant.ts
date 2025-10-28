import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { searchCustomerByName, findBestCustomerMatch } from '@/lib/api/customer-search';
import { applyBookingPreset, type SmartDefaults, type PartialBookingData } from '@/lib/booking-presets';
import { useLastBooking } from './useLastBooking';

export type Message = {
  role: 'user' | 'assistant' | 'tool';
  content: string;
  tool_call_id?: string;
  tool_calls?: ToolCall[];
};

export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface AIAssistantOptions {
  onBookingUpdate?: (updates: PartialBookingData) => void;
}

export const useAIAssistant = (options?: AIAssistantOptions) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentCustomerId, setCurrentCustomerId] = useState<string | null>(null);
  const { toast } = useToast();
  const { data: smartDefaults } = useLastBooking(currentCustomerId);

  // Execute AI tool calls
  const executeToolCalls = useCallback(async (toolCalls: ToolCall[]) => {
    console.log('[AIAssistant] Executing tool calls:', toolCalls);
    
    const toolResults = await Promise.all(
      toolCalls.map(async (call) => {
        try {
          if (call.function.name === 'search_customer_by_name') {
            const { name } = JSON.parse(call.function.arguments);
            console.log(`[AIAssistant] Searching for customer: "${name}"`);
            
            // Get all matches to check for ambiguity
            const allMatches = await searchCustomerByName(name);
            
            if (allMatches.length === 0) {
              console.log(`[AIAssistant] No customer found for: "${name}"`);
              return {
                tool_call_id: call.id,
                role: 'tool' as const,
                content: JSON.stringify({
                  success: false,
                  error: 'customer_not_found',
                  message: `I couldn't find a customer named "${name}". Would you like to create a new customer?`
                })
              };
            }
            
            // Check for ambiguous matches (multiple high-scoring results)
            const highScoreMatches = allMatches.filter(m => m.match_score >= 70);
            
            if (highScoreMatches.length > 1) {
              console.log(`[AIAssistant] Multiple customers found for: "${name}"`, highScoreMatches.map(m => m.full_name));
              return {
                tool_call_id: call.id,
                role: 'tool' as const,
                content: JSON.stringify({
                  success: false,
                  error: 'ambiguous_customer',
                  message: `I found ${highScoreMatches.length} customers matching "${name}". Which one do you mean?`,
                  options: highScoreMatches.map(m => ({
                    id: m.id,
                    name: m.full_name,
                    phone: m.phone,
                    email: m.email,
                  }))
                })
              };
            }
            
            // Single clear match
            const customer = highScoreMatches[0] || allMatches[0];
            setCurrentCustomerId(customer.id);
            console.log(`[AIAssistant] Found customer: ${customer.full_name} (score: ${customer.match_score})`);
            
            return {
              tool_call_id: call.id,
              role: 'tool' as const,
              content: JSON.stringify({
                success: true,
                customer: {
                  id: customer.id,
                  name: customer.full_name,
                  phone: customer.phone,
                  email: customer.email,
                }
              })
            };
          }
          
          if (call.function.name === 'create_quick_booking') {
            const params = JSON.parse(call.function.arguments);
            console.log('[AIAssistant] Creating quick booking:', params);
            
            // Convert smartDefaults to compatible format
            const convertedDefaults: SmartDefaults | undefined = smartDefaults ? {
              reservationType: smartDefaults.reservationType === 'vehicle_class' ? 'vehicle_class' : 
                               smartDefaults.reservationType === 'make_model' ? 'make_model' : 
                               'specific_vin',
              vehicleClassId: smartDefaults.vehicleClassId,
              pickupLocationId: smartDefaults.pickupLocation,
              returnLocationId: smartDefaults.returnLocation,
              insurancePackageId: smartDefaults.insurancePackage,
              // Convert selectedAddOns from string[] to { id, name }[]
              selectedAddOns: smartDefaults.selectedAddOns?.map(id => ({ id, name: id })),
              // Convert addOnCharges from Record to Array
              addOnCharges: Object.entries(smartDefaults.addOnCharges || {}).map(([addon_id, charge_amount]) => ({
                addon_id,
                charge_amount,
              })),
            } : undefined;
            
            // Apply booking preset with smart defaults
            const bookingData = applyBookingPreset(
              params.bookingType,
              convertedDefaults
            );
            
            // Merge with customer info
            const fullBookingData: PartialBookingData = {
              customerId: params.customerId,
              customerName: params.customerName,
              ...bookingData,
            };
            
            // Trigger callback to update wizard
            options?.onBookingUpdate?.(fullBookingData);
            
            return {
              tool_call_id: call.id,
              role: 'tool' as const,
              content: JSON.stringify({
                success: true,
                bookingType: params.bookingType,
                customerName: params.customerName,
                dates: {
                  pickup: bookingData.pickupDate,
                  return: bookingData.returnDate,
                }
              })
            };
          }
          
          // Unknown tool
          return {
            tool_call_id: call.id,
            role: 'tool' as const,
            content: JSON.stringify({
              success: false,
              error: 'Unknown tool'
            })
          };
          
        } catch (error) {
          console.error('[AIAssistant] Tool execution error:', error);
          return {
            tool_call_id: call.id,
            role: 'tool' as const,
            content: JSON.stringify({
              success: false,
              error: error instanceof Error ? error.message : 'Tool execution failed'
            })
          };
        }
      })
    );
    
    return toolResults;
  }, [options, smartDefaults]);

  const streamChat = useCallback(async (
    userMessage: string,
    currentRoute?: string,
    previousToolResults?: Message[]
  ) => {
    const newUserMessage: Message = { role: 'user', content: userMessage };
    
    // Only add user message if not a tool result continuation
    if (!previousToolResults) {
      setMessages(prev => [...prev, newUserMessage]);
    }
    
    setIsLoading(true);

    const CHAT_URL = `https://tbmcmbldoaespjlhpfys.supabase.co/functions/v1/ai-assistant-chat`;

    try {
      const messagesToSend = previousToolResults 
        ? [...messages, ...previousToolResults]
        : [...messages, newUserMessage];

      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRibWNtYmxkb2Flc3BqbGhwZnlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MTQzMzcsImV4cCI6MjA2OTM5MDMzN30.4uJ4xpyZENd15IPQ-ctaouZ0Q7HFNr-CsRtJ0O7bqNs`,
        },
        body: JSON.stringify({
          messages: messagesToSend,
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
      let toolCalls: ToolCall[] = [];

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
            const delta = parsed.choices?.[0]?.delta;
            const content = delta?.content as string | undefined;
            const deltaToolCalls = delta?.tool_calls;
            
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
            
            // Handle tool calls
            if (deltaToolCalls) {
              deltaToolCalls.forEach((tc: any) => {
                const index = tc.index || 0;
                if (!toolCalls[index]) {
                  toolCalls[index] = {
                    id: tc.id || '',
                    type: 'function',
                    function: {
                      name: tc.function?.name || '',
                      arguments: tc.function?.arguments || '',
                    }
                  };
                } else {
                  // Append to existing tool call
                  if (tc.function?.arguments) {
                    toolCalls[index].function.arguments += tc.function.arguments;
                  }
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

      // If AI made tool calls, execute them and continue conversation
      if (toolCalls.length > 0) {
        console.log('[AIAssistant] AI requested tool calls:', toolCalls);
        
        const toolResults = await executeToolCalls(toolCalls);
        
        // Add tool results to messages
        setMessages(prev => [...prev, ...toolResults]);
        
        // Continue conversation with tool results
        setIsLoading(false);
        await streamChat('', currentRoute, toolResults);
        return;
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: 'Error',
        description: 'Failed to get response from AI assistant. Please try again.',
        variant: 'destructive',
      });
      if (!previousToolResults) {
        setMessages(prev => prev.slice(0, -1)); // Remove user message on error
      }
      setIsLoading(false);
    }
  }, [messages, toast, executeToolCalls]);

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
