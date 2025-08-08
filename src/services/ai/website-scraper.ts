import axios from 'axios';
import * as cheerio from 'cheerio';

export class WebsiteScraper {
  async scrapeWebsite(url: string): Promise<string> {
    try {
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);

      // Remove scripts, styles and non-text content
      $('script').remove();
      $('style').remove();
      $('nav').remove();
      $('footer').remove();

      return $('body').text().trim();
    } catch (error) {
      console.error('Error scraping website:', error);
      return '';
    }
  }
}
