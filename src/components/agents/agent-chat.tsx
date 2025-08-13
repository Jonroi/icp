import {
  type KeyboardEvent,
  useRef,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { X, Send, Bot, Zap, Wrench, MoreHorizontal } from 'lucide-react';
import { Button } from '../ui/button';
import { useVercelAI } from '@/services/ai/vercel-ai-service';
import type { ChatMessage } from '@/services/ai/vercel-ai-service';
import type { AgentConfig, AgentTool } from './types';
import { agentManager } from './agent-manager';

interface AgentChatProps {
  onClose?: () => void;
  agentId: string;
  onMessageReceived?: (message: string) => void;
  onToolExecuted?: (toolName: string, result: any) => void;
  initialMessage?: string;
  context?: any;
}

export function AgentChat({
  onClose,
  agentId,
  onMessageReceived,
  onToolExecuted,
  initialMessage,
  context,
}: AgentChatProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [agent, setAgent] = useState<AgentConfig | undefined>();
  const [availableTools, setAvailableTools] = useState<AgentTool[]>([]);
  const [toolResults, setToolResults] = useState<Record<string, any>>({});
  const [customMessages, setCustomMessages] = useState<ChatMessage[]>([]);
  const [showActionButtons, setShowActionButtons] = useState(true);

  // Get agent configuration
  useEffect(() => {
    try {
      const agentConfig = agentManager.getAgent(agentId);
      if (!agentConfig) {
        console.error(`Agent "${agentId}" not found in agent manager`);
        return;
      }
      setAgent(agentConfig);
      setAvailableTools(agentConfig?.tools || []);

      // Reset button visibility when agent changes
      setShowActionButtons(true);
    } catch (error) {
      console.error('Error loading agent configuration:', error);
    }
  }, [agentId]);

  // Initialize useVercelAI only when agent is loaded
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } =
    useVercelAI({
      systemMessage: agent?.instructions || '',
      onError: (error) => {
        console.error('Agent chat error:', error);
      },
      onMessageReceived,
      initialAssistantMessage: initialMessage,
    });

  // Keep input focused throughout the conversation
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, customMessages]);

  // Keep input focused after messages are added
  useEffect(() => {
    if (inputRef.current && !isLoading) {
      inputRef.current.focus();
    }
  }, [messages, customMessages, isLoading]);

  // Always show action buttons initially for better UX
  useEffect(() => {
    if (agent && availableTools.length > 0) {
      setShowActionButtons(true);
    }
  }, [agent, availableTools]);

  // Auto-trigger data check for company profile agent
  useEffect(() => {
    if (agentId === 'company-profile-agent' && agent) {
      // Auto-check current data after a short delay (no visible user message)
      const timer = setTimeout(async () => {
        try {
          // Use the agent manager to execute the tool properly (background operation)
          const result = await agentManager.executeTool(
            agentId,
            'get_current_form_data',
            {},
          );

          // Create a response message based on the data
          let responseContent = '';
          if (result && result.currentData) {
            const filledCount = result.filledFields?.length || 0;
            const totalFields = 18;
            const percentage = Math.round((filledCount / totalFields) * 100);

            if (filledCount === 0) {
              responseContent = `I can see we're starting fresh! You have 0 out of ${totalFields} fields filled.`;
            } else if (result.isComplete) {
              responseContent = `Great! I can see you have a complete profile for "${
                result.currentData.name || 'your company'
              }". You have ${filledCount} out of ${totalFields} fields filled (${percentage}% complete).`;
            } else {
              responseContent = `I can see you have a profile for "${
                result.currentData.name || 'your company'
              }". You have ${filledCount} out of ${totalFields} fields filled (${percentage}% complete).`;
            }
          } else {
            responseContent = `I can see we're starting fresh! You have 0 out of 18 fields filled.`;
          }

          const assistantMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant' as const,
            content: responseContent,
          };

          // Add assistant message to custom messages
          setCustomMessages((prev) => [...prev, assistantMessage]);

          // Call callbacks
          onMessageReceived?.(responseContent);
        } catch (error) {
          console.error('Error auto-checking form data:', error);

          // Fallback message if tool execution fails
          const fallbackMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant' as const,
            content: `I can see we're starting fresh! You have 0 out of 18 fields filled.`,
          };

          setCustomMessages((prev) => [...prev, fallbackMessage]);
          onMessageReceived?.(fallbackMessage.content);
        }
      }, 1500); // 1.5 second delay to let the greeting sink in

      return () => clearTimeout(timer);
    }
  }, [agentId, agent, onMessageReceived]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      handleSubmit(e);
    }
  };

  const handleSuggestionClick = async (suggestion: string) => {
    // Hide action buttons when any button is clicked
    setShowActionButtons(false);

    // Create a user message directly
    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: suggestion,
    };

    // Add user message to custom messages immediately
    setCustomMessages((prev) => [...prev, userMessage]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: suggestion }],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: data.content,
      };

      // Add assistant message to custom messages
      setCustomMessages((prev) => [...prev, assistantMessage]);

      // Call callbacks
      onMessageReceived?.(data.content);

      // Check for tool execution in the response
      if (
        data.content.includes('tool') ||
        data.content.includes('FILL_FIELD')
      ) {
        onToolExecuted?.('suggestion_click', {
          suggestion,
          response: data.content,
        });
      }
    } catch (error) {
      console.error('Error sending suggestion:', error);
    }
  };

  const handleToolClick = async (tool: AgentTool) => {
    try {
      // Execute the tool with context
      const result = await agentManager.executeTool(agentId, tool.name, {
        ...context,
        userQuery: input,
      });

      // Store tool result
      setToolResults((prev) => ({
        ...prev,
        [tool.name]: result,
      }));

      // Notify parent component
      onToolExecuted?.(tool.name, result);

      // Add tool result to conversation
      const toolMessage = `Tool "${
        tool.name
      }" executed successfully. Result: ${JSON.stringify(result, null, 2)}`;
      onMessageReceived?.(toolMessage);
    } catch (error) {
      console.error(`Error executing tool ${tool.name}:`, error);
      const errorMessage = `Error executing tool "${tool.name}": ${error}`;
      onMessageReceived?.(errorMessage);
    }
  };

  const handleTextareaKeyDown = (
    e: KeyboardEvent<HTMLTextAreaElement>,
  ): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as React.FormEvent);
    }
  };

  // Typing indicator component
  const TypingIndicator = () => (
    <div className='mr-auto max-w-[75%] rounded-lg bg-zinc-800 px-4 py-3 text-sm'>
      <div className='flex items-center gap-2'>
        <div className='flex space-x-1'>
          <div
            className='w-2 h-2 bg-zinc-400 rounded-full typing-dot'
            style={{ animationDelay: '0ms' }}></div>
          <div
            className='w-2 h-2 bg-zinc-400 rounded-full typing-dot'
            style={{ animationDelay: '150ms' }}></div>
          <div
            className='w-2 h-2 bg-zinc-400 rounded-full typing-dot'
            style={{ animationDelay: '300ms' }}></div>
        </div>
        <span className='text-zinc-400 text-xs'>
          {agent?.name} is typing...
        </span>
      </div>
    </div>
  );

  // Don't render the chat interface until agent is loaded
  if (!agent) {
    return (
      <div className='flex h-[700px] w-full flex-col bg-zinc-900/95 text-zinc-100'>
        <div className='flex items-center justify-between border-b border-zinc-800 px-4 py-3'>
          <div className='flex items-center gap-2 text-sm font-medium text-zinc-200'>
            <Bot className='h-5 w-5 text-primary' /> Loading Agent...
          </div>
          <Button variant='ghost' size='icon' onClick={onClose} title='Close'>
            <X className='h-4 w-4' />
          </Button>
        </div>
        <div className='flex-1 flex items-center justify-center'>
          <p className='text-zinc-400'>
            Loading agent &quot;{agentId}&quot;...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex h-[700px] w-full flex-col bg-zinc-900/95 text-zinc-100'>
      <div className='flex items-center justify-between border-b border-zinc-800 px-4 py-3'>
        <div className='flex items-center gap-2 text-sm font-medium text-zinc-200'>
          <Bot className='h-5 w-5 text-primary' /> {agent.name}
        </div>
        <Button variant='ghost' size='icon' onClick={onClose} title='Close'>
          <X className='h-4 w-4' />
        </Button>
      </div>

      {/* Quick Suggestions - Only show a few key ones */}
      {Array.isArray(agent.suggestions) && agent.suggestions.length > 0 && (
        <div className='flex flex-wrap gap-2 border-b border-zinc-800 px-4 py-3'>
          {agent.suggestions.slice(0, 3).map((q, idx) => (
            <Button
              key={idx}
              size='sm'
              variant='outline'
              className='text-sm'
              onClick={() => handleSuggestionClick(q)}
              disabled={isLoading}
              title={q}>
              {isLoading ? 'Sending...' : q}
            </Button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div className='flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-600 scrollbar-track-zinc-800'>
        {[
          ...messages.filter((m) => m.role !== 'system'),
          ...customMessages,
        ].map((m, idx) => {
          // For company profile agent, filter out FILL_FIELD lines from display
          let displayContent = m.content;
          if (agentId === 'company-profile-agent' && m.role === 'assistant') {
            displayContent = m.content
              .replace(/FILL_FIELD:\s*\w+\s*=\s*.+?(?:\n|$)/g, '')
              .trim();
          }

          return (
            <div key={idx}>
              <div
                className={
                  m.role === 'user'
                    ? 'ml-auto max-w-[75%] rounded-lg bg-primary/10 px-4 py-3 text-sm'
                    : 'mr-auto max-w-[75%] rounded-lg bg-zinc-800 px-4 py-3 text-sm'
                }>
                {displayContent}
              </div>

              {/* Quick Actions after bot messages for Company Profile Agent */}
              {agentId === 'company-profile-agent' &&
                m.role === 'assistant' &&
                (displayContent.includes('fields filled') ||
                  displayContent.includes('profile for')) &&
                showActionButtons && (
                  <div className='flex flex-wrap gap-2 mt-3 ml-0'>
                    {/* Show different buttons based on data state */}
                    {context?.currentData &&
                    context.currentData.filledFields &&
                    context.currentData.filledFields.length > 0 ? (
                      <>
                        <Button
                          size='sm'
                          variant='outline'
                          className='text-sm'
                          onClick={() =>
                            handleSuggestionClick('Fill missing fields')
                          }
                          disabled={isLoading}
                          title='Continue filling'>
                          Continue filling
                        </Button>
                        <Button
                          size='sm'
                          variant='outline'
                          className='text-sm'
                          onClick={() =>
                            handleSuggestionClick('Get smart suggestions')
                          }
                          disabled={isLoading}
                          title='Smart suggestions'>
                          Smart suggestions
                        </Button>
                        <Button
                          size='sm'
                          variant='outline'
                          className='text-sm'
                          onClick={() =>
                            handleSuggestionClick('Validate form completion')
                          }
                          disabled={isLoading}
                          title='Validate form'>
                          Validate form
                        </Button>
                        <Button
                          size='sm'
                          variant='outline'
                          className='text-sm'
                          onClick={() =>
                            handleSuggestionClick('Batch fill multiple fields')
                          }
                          disabled={isLoading}
                          title='Batch fill'>
                          Batch fill
                        </Button>
                        <Button
                          size='sm'
                          variant='outline'
                          className='text-sm'
                          onClick={() => handleSuggestionClick('Reset form')}
                          disabled={isLoading}
                          title='Start fresh'>
                          Start fresh
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size='sm'
                          variant='outline'
                          className='text-sm'
                          onClick={() =>
                            handleSuggestionClick(
                              'Start systematic form filling',
                            )
                          }
                          disabled={isLoading}
                          title='Start filling'>
                          Start filling
                        </Button>
                        <Button
                          size='sm'
                          variant='outline'
                          className='text-sm'
                          onClick={() =>
                            handleSuggestionClick('Load test company')
                          }
                          disabled={isLoading}
                          title='Load test company'>
                          Load test company
                        </Button>
                        <Button
                          size='sm'
                          variant='outline'
                          className='text-sm'
                          onClick={() =>
                            handleSuggestionClick('Get smart suggestions')
                          }
                          disabled={isLoading}
                          title='Smart suggestions'>
                          Smart suggestions
                        </Button>
                      </>
                    )}
                  </div>
                )}
            </div>
          );
        })}

        {/* AI Typing Indicator */}
        {isLoading && <TypingIndicator />}

        {error && (
          <div className='mr-auto max-w-[75%] rounded-lg border border-red-600 bg-red-950/40 px-4 py-3 text-sm text-red-200'>
            {error.message}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className='border-t border-zinc-800 p-4'>
        <div className='flex items-end gap-3'>
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleTextareaKeyDown}
            placeholder={agent.placeholder}
            rows={3}
            className='flex-1 resize-none rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary'
            disabled={isLoading}
            autoFocus
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || input.trim().length === 0}
            size='lg'
            title='Send'>
            <Send className='h-5 w-5' />
          </Button>
        </div>
      </div>
    </div>
  );
}
