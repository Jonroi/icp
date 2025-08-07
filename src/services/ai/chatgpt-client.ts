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
    // Mappaa ChatGPT-mallit Ollama-malleihin
    this.modelMapping = {
      'gpt-3.5-turbo': 'llama3.2:3b-instruct-q4_K_M',
      'gpt-4': 'llama3.2:3b-instruct-q4_K_M',
      'gpt-4-turbo': 'llama3.2:3b-instruct-q4_K_M',
      'claude-3': 'llama3.2:3b-instruct-q4_K_M',
      default: 'llama3.2:3b-instruct-q4_K_M',
    };

    this.ollamaClient = new OllamaClient();
    console.log(`🤖 ChatGPTClient alustettu:`);
    console.log(`   📋 Käytettävät mallit:`, Object.keys(this.modelMapping));
  }

  async createChatCompletion(
    request: ChatCompletionRequest,
  ): Promise<ChatCompletionResponse> {
    console.log(`💬 Aloitetaan ChatGPT-kompatiibeli pyyntö:`);
    console.log(`   🤖 Pyydetty malli: ${request.model}`);
    console.log(`   💭 Viestien määrä: ${request.messages.length}`);
    console.log(`   🌡️  Temperature: ${request.temperature || 'default'}`);
    console.log(`   📏 Max tokens: ${request.max_tokens || 'default'}`);

    const ollamaModel =
      this.modelMapping[request.model] || this.modelMapping.default;

    console.log(`   🔄 Mappattu malli: ${request.model} → ${ollamaModel}`);

    // Käytä viimeisintä käyttäjän viestiä
    const userMessages = request.messages.filter((m) => m.role === 'user');
    const systemMessages = request.messages.filter((m) => m.role === 'system');

    const lastUserMessage =
      userMessages[userMessages.length - 1]?.content || '';
    const systemPrompt =
      systemMessages[systemMessages.length - 1]?.content || '';

    console.log(
      `   👤 Käytetään viimeistä user-viestiä: ${lastUserMessage.length} merkkiä`,
    );
    console.log(
      `   ⚙️  System prompt: ${
        systemPrompt ? systemPrompt.length + ' merkkiä' : 'Ei'
      }`,
    );

    try {
      const startTime = Date.now();
      const response = await this.ollamaClient.generateResponse(
        lastUserMessage,
        systemPrompt,
      );
      const endTime = Date.now();

      console.log(`✅ ChatGPT-kompatiibeli vastaus valmis:`);
      console.log(`   ⏱️  Kesto: ${endTime - startTime}ms`);
      console.log(`   📊 Vastauksen pituus: ${response.length} merkkiä`);

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
      console.error(`❌ ChatGPT-kompatiibeli pyyntö epäonnistui:`);
      console.error(`   🔍 Virhe:`, error);
      throw new Error(`ChatGPT-kompatiibeli palvelu epäonnistui: ${error}`);
    }
  }

  // Yksinkertainen metodi suorille viesteille
  async sendMessage(message: string, systemPrompt?: string): Promise<string> {
    console.log(`💬 Yksinkertainen viesti:`);
    console.log(`   📝 Viestin pituus: ${message.length} merkkiä`);
    console.log(`   ⚙️  System prompt: ${systemPrompt ? 'Kyllä' : 'Ei'}`);

    return this.ollamaClient.generateResponse(message, systemPrompt);
  }
}
