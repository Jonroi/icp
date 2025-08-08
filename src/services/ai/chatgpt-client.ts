import { OllamaClient } from './ollama-client';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class ChatGPTClient {
  private ollamaClient: OllamaClient;
  private modelMapping: Record<string, string>;

  constructor() {
    // Map ChatGPT models to Ollama models
    this.modelMapping = {
      'gpt-3.5-turbo': 'llama3.2:3b-instruct-q4_K_M',
      'gpt-4': 'llama3.2:3b-instruct-q4_K_M',
      'gpt-4-turbo': 'llama3.2:3b-instruct-q4_K_M',
      'claude-3': 'llama3.2:3b-instruct-q4_K_M',
      default: 'llama3.2:3b-instruct-q4_K_M',
    };

    this.ollamaClient = new OllamaClient();
    console.log(`🤖 ChatGPTClient initialized:`);
    console.log(`   📋 Available models:`, Object.keys(this.modelMapping));
  }

  async createChatCompletion(
    request: ChatCompletionRequest,
  ): Promise<ChatCompletionResponse> {
    console.log(`💬 Starting ChatGPT-compatible request:`);
    console.log(`   🤖 Requested model: ${request.model}`);
    console.log(`   💭 Messages: ${request.messages.length}`);
    console.log(`   🌡️  Temperature: ${request.temperature || 'default'}`);
    console.log(`   📏 Max tokens: ${request.max_tokens || 'default'}`);

    const ollamaModel =
      this.modelMapping[request.model] || this.modelMapping.default;

    console.log(`   🔄 Mapped model: ${request.model} → ${ollamaModel}`);

    // Use the latest user message
    const userMessages = request.messages.filter((m) => m.role === 'user');
    const systemMessages = request.messages.filter((m) => m.role === 'system');

    const lastUserMessage =
      userMessages[userMessages.length - 1]?.content || '';
    const systemPrompt =
      systemMessages[systemMessages.length - 1]?.content || '';

    console.log(
      `   👤 Using last user message: ${lastUserMessage.length} chars`,
    );
    console.log(
      `   ⚙️  System prompt: ${
        systemPrompt ? systemPrompt.length + ' chars' : 'None'
      }`,
    );

    try {
      const startTime = Date.now();
      const response = await this.ollamaClient.generateResponse(
        lastUserMessage,
        systemPrompt,
      );
      const endTime = Date.now();

      console.log(`✅ ChatGPT-compatible response ready:`);
      console.log(`   ⏱️  Duration: ${endTime - startTime}ms`);
      console.log(`   📊 Response length: ${response.length} chars`);

      return {
        id: `chatcmpl-${Date.now()}`,
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: request.model,
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: response,
            },
            finish_reason: 'stop',
          },
        ],
        usage: {
          prompt_tokens: lastUserMessage.length + systemPrompt.length,
          completion_tokens: response.length,
          total_tokens:
            lastUserMessage.length + systemPrompt.length + response.length,
        },
      };
    } catch (error) {
      console.error(`❌ ChatGPT-compatible request failed:`);
      console.error(`   🔍 Error:`, error);
      throw new Error(`ChatGPT-compatible service failed: ${error}`);
    }
  }

  // Simple method for direct messages
  async sendMessage(message: string, systemPrompt?: string): Promise<string> {
    console.log(`💬 Simple message:`);
    console.log(`   📝 Message length: ${message.length} chars`);
    console.log(`   ⚙️  System prompt: ${systemPrompt ? 'Yes' : 'No'}`);

    return this.ollamaClient.generateResponse(message, systemPrompt);
  }
}
