export class ReviewsService {
  static async fetchCustomerReviews(companyName: string): Promise<string> {
    try {
      // Use real Ollama to generate customer reviews
      const prompt = `Generate 5 realistic customer reviews for company: ${companyName}

Create diverse, authentic customer reviews that include:
- Mix of positive and constructive feedback
- Different customer perspectives
- Realistic language and scenarios
- Various rating levels (mostly positive)

Respond with only the review text, one review per line. No JSON, no formatting, just plain text reviews separated by newlines.

Example format:
Review 1 text here
Review 2 text here  
Review 3 text here
Review 4 text here
Review 5 text here`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000); // 25 second timeout

      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3.2:3b',
          prompt: prompt,
          stream: false,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      // Clean the response and use it as reviews text
      const reviewsText = data.response.trim();

      return reviewsText;
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      throw error;
    }
  }
}
