import axios from 'axios';

export class OllamaClient {
  private ollamaUrl: string;
  private model: string;

  constructor(model: string = 'llama3.2:3b-instruct-q4_K_M') {
    this.ollamaUrl = 'http://localhost:11434/api/generate';
    this.model = model;
    console.log(`🤖 OllamaClient alustettu mallilla: ${this.model}`);
  }

  async generateResponse(
    prompt: string,
    systemPrompt?: string,
  ): Promise<string> {
    console.log(`🚀 Aloitetaan LLM-generaatio:`);
    console.log(`   📋 Malli: ${this.model}`);
    console.log(`   🔗 URL: ${this.ollamaUrl}`);
    console.log(`   📝 Prompt pituus: ${prompt.length} merkkiä`);
    console.log(`   ⚙️  System prompt: ${systemPrompt ? 'Kyllä' : 'Ei'}`);

    try {
      const fullPrompt = systemPrompt
        ? `<|system|>${systemPrompt}</s><|user|>${prompt}</s><|assistant|>`
        : `<|user|>${prompt}</s><|assistant|>`;

      console.log(`📤 Lähetetään pyyntö Ollamalle...`);

      const startTime = Date.now();
      const response = await axios.post(this.ollamaUrl, {
        model: this.model,
        prompt: fullPrompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 2048,
        },
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`✅ LLM-vastaus saatu:`);
      console.log(`   ⏱️  Kesto: ${duration}ms`);
      console.log(
        `   📊 Vastauksen pituus: ${
          response.data.response?.length || 0
        } merkkiä`,
      );
      console.log(`   🎯 Status: ${response.status}`);

      const result = response.data.response || 'Analyysi epäonnistui';

      if (result === 'Analyysi epäonnistui') {
        console.warn(`⚠️  LLM palautti tyhjän vastauksen`);
      } else {
        console.log(`✅ LLM-generaatio onnistui!`);
      }

      return result;
    } catch (error) {
      console.error(`❌ LLM-generaatio epäonnistui:`);
      console.error(`   🔍 Virhe:`, error);

      if (axios.isAxiosError(error)) {
        console.error(`   📡 HTTP Status: ${error.response?.status}`);
        console.error(`   📄 Response:`, error.response?.data);
      }

      throw new Error(
        `Paikallinen LLM ei ole saatavilla. Asenna Ollama: https://ollama.ai ja lataa malli: ollama pull ${this.model}`,
      );
    }
  }

  async analyzeReviews(reviewTexts: string): Promise<string> {
    console.log(`📊 Aloitetaan arvostelujen analyysi:`);
    console.log(`   📝 Arvosteluja: ${reviewTexts.split('\n').length} kpl`);
    console.log(`   📏 Kokonaispituus: ${reviewTexts.length} merkkiä`);

    const systemPrompt = `Olet asiakasarvostelujen analysoija. Anna ytimekkäitä ja hyödyllisiä vastauksia suomeksi.`;

    const prompt = `Analysoi seuraavat asiakasarvostelut ja kerro:
1. Yleisimmät positiiviset teemat
2. Yleisimmät negatiiviset teemat  
3. Parannusehdotukset
4. Yhteenveto asiakkaiden kokemuksista

Arvostelut:
${reviewTexts}`;

    return this.generateResponse(prompt, systemPrompt);
  }

  // ChatGPT-kompatiibeli metodi
  async chatCompletion(
    messages: Array<{ role: string; content: string }>,
  ): Promise<string> {
    console.log(`💬 Aloitetaan ChatGPT-kompatiibeli keskustelu:`);
    console.log(`   💭 Viestien määrä: ${messages.length}`);

    const systemMessages = messages.filter((m) => m.role === 'system');
    const userMessages = messages.filter((m) => m.role === 'user');
    const assistantMessages = messages.filter((m) => m.role === 'assistant');

    console.log(`   ⚙️  System viestejä: ${systemMessages.length}`);
    console.log(`   👤 User viestejä: ${userMessages.length}`);
    console.log(`   🤖 Assistant viestejä: ${assistantMessages.length}`);

    const systemMessage =
      messages.find((m) => m.role === 'system')?.content || '';
    const lastUserMessage =
      userMessages[userMessages.length - 1]?.content || '';

    return this.generateResponse(lastUserMessage, systemMessage);
  }
}
