import { generateText } from 'ai';
import { ollama } from 'ollama-ai-provider-v2';

export class AISDKService {
  private model: string;
  private static instance: AISDKService | null = null;

  private constructor() {
    this.model =
      (typeof process !== 'undefined' && process.env?.OLLAMA_MODEL) ||
      (typeof process !== 'undefined' &&
        process.env?.NEXT_PUBLIC_OLLAMA_MODEL) ||
      'llama3.2:3b';

    console.log(`🤖 AISDKService initialized with model: ${this.model}`);
  }

  public static getInstance(): AISDKService {
    if (!AISDKService.instance) {
      AISDKService.instance = new AISDKService();
    }
    return AISDKService.instance;
  }

  /**
   * Generate text using AI SDK with Ollama
   */
  async generateText(params: {
    prompt: string;
    system?: string;
    maxTokens?: number;
  }): Promise<string> {
    const { prompt, system, maxTokens = 4000 } = params;

    console.log(`🚀 Starting AI SDK generation:`);
    console.log(`   📋 Model: ${this.model}`);
    console.log(`   📝 Prompt length: ${prompt.length} chars`);
    console.log(`   ⚙️  System prompt: ${system ? 'Yes' : 'No'}`);
    console.log(`   🎯 Max tokens: ${maxTokens}`);

    try {
      console.log(`📤 Sending request to Ollama via AI SDK...`);

      const startTime = Date.now();

      const { text } = await generateText({
        model: ollama(this.model),
        prompt,
        system,
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`✅ AI SDK response received:`);
      console.log(`   ⏱️  Duration: ${duration}ms`);
      console.log(`   📊 Response length: ${text?.length || 0} chars`);

      if (!text || text.trim() === '') {
        console.warn(`⚠️  AI SDK returned an empty response`);
        return 'Analysis failed';
      }

      console.log(`✅ AI SDK generation succeeded!`);
      return text;
    } catch (error) {
      console.error(`❌ AI SDK generation failed:`);
      console.error(`   🔍 Error:`, error);

      throw new Error(
        `Local LLM not available. Install Ollama: https://ollama.ai and pull model: ollama pull ${this.model}`,
      );
    }
  }

  /**
   * Generate response with system prompt (compatibility method)
   */
  async generateResponse(
    prompt: string,
    systemPrompt?: string,
  ): Promise<string> {
    return this.generateText({
      prompt,
      system: systemPrompt,
    });
  }

  /**
   * ChatGPT-compatible method
   */
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

  /**
   * Analyze reviews (compatibility method)
   */
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
}
