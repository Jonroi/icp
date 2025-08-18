import axios from 'axios';
import { estimateTokenCount, checkTokenLimit } from '@/lib/utils';

export class OllamaClient {
  private ollamaUrl: string;
  private model: string;
  private static instance: OllamaClient | null = null;

  private constructor(model: string = 'llama3.2:3b') {
    const envModel =
      (typeof process !== 'undefined' && process.env?.OLLAMA_MODEL) ||
      (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_OLLAMA_MODEL);
    const envUrl =
      (typeof process !== 'undefined' && process.env?.OLLAMA_URL) ||
      (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_OLLAMA_URL);
    this.ollamaUrl = (envUrl || 'http://localhost:11434') + '/api/generate';
    this.model = envModel || model;
    console.log(`🤖 OllamaClient initialized with model: ${this.model}`);
  }

  public static getInstance(model?: string): OllamaClient {
    if (!OllamaClient.instance) {
      OllamaClient.instance = new OllamaClient(model);
    }
    return OllamaClient.instance;
  }

  async generateResponse(
    prompt: string,
    systemPrompt?: string,
  ): Promise<string> {
    const fullPrompt = systemPrompt
      ? `<|system|>${systemPrompt}</s><|user|>${prompt}</s><|assistant|>`
      : `<|user|>${prompt}</s><|assistant|>`;

    const tokenInfo = checkTokenLimit(fullPrompt, 10000);

    console.log(`🚀 Starting LLM generation:`);
    console.log(`   📋 Model: ${this.model}`);
    console.log(`   🔗 URL: ${this.ollamaUrl}`);
    console.log(`   📝 Prompt length: ${prompt.length} chars`);
    console.log(
      `   🎯 Token count: ${tokenInfo.tokenCount}/${10000} (${
        tokenInfo.percentage
      }%)`,
    );
    console.log(`   ⚙️  System prompt: ${systemPrompt ? 'Yes' : 'No'}`);

    if (!tokenInfo.isWithinLimit) {
      console.warn(`⚠️  WARNING: Token count exceeds limit!`);
    }

    try {
      console.log(`📤 Sending request to Ollama...`);

      const startTime = Date.now();
      const response = await axios.post(this.ollamaUrl, {
        model: this.model,
        prompt: fullPrompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 10000,
          num_ctx: 10000,
        },
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`✅ LLM response received:`);
      console.log(`   ⏱️  Duration: ${duration}ms`);
      console.log(
        `   📊 Response length: ${response.data.response?.length || 0} chars`,
      );
      console.log(`   🎯 Status: ${response.status}`);

      const result = response.data.response || 'Analysis failed';

      if (result === 'Analysis failed') {
        console.warn(`⚠️  LLM returned an empty response`);
      } else {
        console.log(`✅ LLM generation succeeded!`);
      }

      return result;
    } catch (error) {
      console.error(`❌ LLM generation failed:`);
      console.error(`   🔍 Error:`, error);

      if (axios.isAxiosError(error)) {
        console.error(`   📡 HTTP Status: ${error.response?.status}`);
        console.error(`   📄 Response:`, error.response?.data);
      }

      throw new Error(
        `Local LLM not available. Install Ollama: https://ollama.ai and pull model: ollama pull ${this.model}`,
      );
    }
  }

  async analyzeReviews(reviewTexts: string): Promise<string> {
    console.log(`📊 Starting review analysis:`);
    console.log(`   📝 Reviews: ${reviewTexts.split('\n').length}`);
    console.log(`   📏 Total length: ${reviewTexts.length} chars`);

    const systemPrompt = `You are a customer review analyst. Provide concise and helpful responses in English.`;

    const prompt = `Analyze the following customer reviews and report:
1. Most common positive themes
2. Most common negative themes
3. Suggestions for improvement
4. Summary of customer experiences

Reviews:
${reviewTexts}`;

    return this.generateResponse(prompt, systemPrompt);
  }

  // ChatGPT-compatible method
  async chatCompletion(
    messages: Array<{ role: string; content: string }>,
  ): Promise<string> {
    console.log(`💬 Starting ChatGPT-compatible conversation:`);
    console.log(`   💭 Messages: ${messages.length}`);

    const systemMessages = messages.filter((m) => m.role === 'system');
    const userMessages = messages.filter((m) => m.role === 'user');
    const assistantMessages = messages.filter((m) => m.role === 'assistant');

    console.log(`   ⚙️  System messages: ${systemMessages.length}`);
    console.log(`   👤 User messages: ${userMessages.length}`);
    console.log(`   🤖 Assistant messages: ${assistantMessages.length}`);

    const systemMessage =
      messages.find((m) => m.role === 'system')?.content || '';
    const lastUserMessage =
      userMessages[userMessages.length - 1]?.content || '';

    return this.generateResponse(lastUserMessage, systemMessage);
  }
}
