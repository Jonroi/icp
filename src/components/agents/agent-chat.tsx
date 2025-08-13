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
import type { OwnCompany } from '@/services/project-service';
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
  const [companyChoices, setCompanyChoices] = useState<
    { id: string; name: string }[]
  >([]);
  const [showCompanyPicker, setShowCompanyPicker] = useState(false);
  const [localCompanyMap, setLocalCompanyMap] = useState<
    Record<string, OwnCompany>
  >({});

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
  const handleMessageDone = useCallback(
    async (message: string) => {
      onMessageReceived?.(message);
      try {
        const resp = await fetch('/api/company-data');
        if (resp.ok) {
          const data = await resp.json();
          onToolExecuted?.('sync_form_state', data?.data || {});
        }
      } catch (_) {}
    },
    [onMessageReceived, onToolExecuted],
  );

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    append,
  } = useVercelAI({
    systemMessage: agent?.instructions || '',
    onError: (error) => {
      console.error('Agent chat error:', error);
    },
    onMessageReceived: handleMessageDone,
    // No pretext message per rules. initialAssistantMessage intentionally omitted
  });

  // Keep input focused throughout the conversation
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    });
  }, [messages, customMessages, isLoading]);

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

  // Do not auto-send bot pretext messages; instead, show action buttons to kick off flows

  // Welcome prompt card for ICP Generator when there is no conversation yet
  const showWelcomeCard =
    agentId === 'company-profile-agent' &&
    messages.filter((m) => m.role !== 'system').length === 0 &&
    customMessages.length === 0;

  const handleStartNewProfile = useCallback(async () => {
    try {
      await agentManager.executeTool(agentId, 'reset_form', {});
      // Also create/select a new company record immediately using manage_company
      await agentManager.executeTool(agentId, 'manage_company', {
        // The tool expects a string; we'll do it via chat to keep flow consistent
      } as any);
    } catch (_) {
      // ignore reset errors; continue to start filling
    }
    await append({ role: 'user', content: 'Start systematic form filling' });
  }, [agentId, append]);

  const handleEditExistingProfile = useCallback(async () => {
    try {
      // Load locally saved companies from localStorage
      let localList: { id: string; name: string }[] = [];
      const localMap: Record<string, OwnCompany> = {};
      if (typeof window !== 'undefined') {
        const savedRaw = localStorage.getItem('saved-companies');
        if (savedRaw) {
          try {
            const saved = JSON.parse(savedRaw) as OwnCompany[];
            for (const c of saved) {
              if (c.id && c.name) {
                localList.push({ id: c.id, name: c.name });
                localMap[c.id] = c;
              }
            }
          } catch (_) {}
        }
      }

      // Fetch server companies
      let serverList: { id: string; name: string }[] = [];
      try {
        const resp = await fetch('/api/company', { cache: 'no-store' });
        if (resp.ok) {
          const json = await resp.json();
          serverList = Array.isArray(json.list) ? json.list : [];
        }
      } catch (_) {}

      // Merge, preferring server entries when ids collide
      const mergedMap = new Map<string, { id: string; name: string }>();
      for (const c of localList) mergedMap.set(c.id, c);
      for (const c of serverList) mergedMap.set(c.id, c);
      const merged = Array.from(mergedMap.values());

      if (merged.length > 0) {
        setLocalCompanyMap(localMap);
        setCompanyChoices(merged.slice(0, 6));
        setShowCompanyPicker(true);
        return;
      }

      // No companies; fall back to test company flow
      await append({ role: 'user', content: 'Load test company' });
    } catch (_) {
      await append({ role: 'user', content: 'Load test company' });
    }
  }, [append]);

  const handleSelectCompany = useCallback(
    async (companyId: string) => {
      let selectedOk = false;
      try {
        const resp = await fetch(
          `/api/company?id=${encodeURIComponent(companyId)}`,
          {
            cache: 'no-store',
          },
        );
        if (resp.ok) {
          const json = await resp.json();
          selectedOk = Boolean(json?.success);
        }
      } catch (_) {}

      // Fallback: if not found on server but exists locally, mirror fields into form
      if (!selectedOk && localCompanyMap[companyId]) {
        const c = localCompanyMap[companyId];
        const keys: (keyof OwnCompany)[] = [
          'name',
          'location',
          'website',
          'social',
          'industry',
          'companySize',
          'targetMarket',
          'valueProposition',
          'mainOfferings',
          'pricingModel',
          'uniqueFeatures',
          'marketSegment',
          'competitiveAdvantages',
          'currentCustomers',
          'successStories',
          'painPointsSolved',
          'customerGoals',
          'currentMarketingChannels',
          'marketingMessaging',
        ];
        for (const k of keys) {
          const v = c[k];
          if (typeof v === 'string' && v.trim() !== '') {
            try {
              await fetch('/api/company-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ field: k, value: v }),
              });
            } catch (_) {}
          }
        }
      }

      setShowCompanyPicker(false);
      try {
        const resp = await fetch('/api/company-data');
        if (resp.ok) {
          const data = await resp.json();
          onToolExecuted?.('sync_form_state', data?.data || {});
        }
      } catch (_) {}
      await append({ role: 'user', content: 'Fill missing fields' });
    },
    [append, localCompanyMap, onToolExecuted],
  );

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      handleSubmit(e);
    }
  };

  const handleSuggestionClick = async (suggestion: string) => {
    // Hide action buttons when any button is clicked
    setShowActionButtons(false);

    // Send suggestion directly as a user message to the chat stream
    await append({ role: 'user', content: suggestion });
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
          {agent.suggestions.slice(0, 4).map((q, idx) => (
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
        {/* Welcome card (non-chat text) */}
        {showWelcomeCard && (
          <div className='mr-auto max-w-[75%] rounded-lg bg-zinc-800 px-4 py-4 text-sm'>
            <div className='space-y-3'>
              <div className='text-zinc-100'>
                ICP Generator helps you fill your company profile quickly so we
                can create strong ICPs.
              </div>
              <div className='text-zinc-300'>
                Do you want to start a new profile or edit an existing one?
              </div>
              <div className='flex gap-2'>
                <Button
                  size='sm'
                  onClick={handleStartNewProfile}
                  title='Start new profile'>
                  Start new
                </Button>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={handleEditExistingProfile}
                  title='Edit existing'>
                  Edit existing
                </Button>
              </div>
              {showCompanyPicker && companyChoices.length > 0 && (
                <div className='mt-2'>
                  <div className='mb-2 text-xs text-zinc-400'>
                    Your companies
                  </div>
                  <div className='flex flex-wrap gap-2'>
                    {companyChoices.map((c) => (
                      <Button
                        key={c.id}
                        size='sm'
                        variant='outline'
                        onClick={() => handleSelectCompany(c.id)}
                        title={`Edit ${c.name}`}>
                        {c.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
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
