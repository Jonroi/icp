import axios from 'axios';

export class OllamaClient {
  private ollamaUrl: string;

  constructor() {
    this.ollamaUrl = 'http://localhost:11434/api/generate';
  }

  async generateResponse(prompt: string): Promise<string> {
    try {
      const response = await axios.post(this.ollamaUrl, {
        model: 'llama3.2:3b',
        prompt: prompt,
        stream: false,
      });

      return response.data.response || 'Analyysi epäonnistui';
    } catch (error) {
      console.error('Ollama error:', error);
      throw new Error(
        'Paikallinen LLM ei ole saatavilla. Asenna Ollama: https://ollama.ai ja lataa malli: ollama pull llama3.2:3b',
      );
    }
  }

  async analyzeReviews(reviewTexts: string): Promise<string> {
    const prompt = `Analysoi seuraavat asiakasarvostelut ja kerro yleisimmät teemat, positiiviset ja negatiiviset asiat:

${reviewTexts}

Anna vastaus suomeksi ja ole ytimekäs.`;

    return this.generateResponse(prompt);
  }
}
