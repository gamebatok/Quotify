import quotesData from '../quotes.json';

class QuoteService {
  static quotes = quotesData.quotes;
  static totalQuotes = quotesData.quotes.length;

  static getRandomQuote() {
    const randomIndex = Math.floor(Math.random() * this.totalQuotes);
    const selectedQuote = this.quotes[randomIndex];
    
    return {
      content: selectedQuote.content,
      author: selectedQuote.author,
      tags: selectedQuote.tags || [],
      id: selectedQuote._id
    };
  }

  static getQuoteById(id) {
    const quote = this.quotes.find(q => q._id === id);
    if (quote) {
      return {
        content: quote.content,
        author: quote.author,
        tags: quote.tags || [],
        id: quote._id
      };
    }
    return null;
  }

  static getQuotesByAuthor(author) {
    return this.quotes
      .filter(q => q.author.toLowerCase().includes(author.toLowerCase()))
      .map(q => ({
        content: q.content,
        author: q.author,
        tags: q.tags || [],
        id: q._id
      }));
  }

  static getQuotesByTag(tag) {
    return this.quotes
      .filter(q => q.tags && q.tags.some(t => t.toLowerCase().includes(tag.toLowerCase())))
      .map(q => ({
        content: q.content,  
        author: q.author,
        tags: q.tags || [],
        id: q._id
      }));
  }

  static searchQuotes(searchTerm) {
    const term = searchTerm.toLowerCase();
    return this.quotes
      .filter(q => 
        q.content.toLowerCase().includes(term) ||
        q.author.toLowerCase().includes(term) ||
        (q.tags && q.tags.some(t => t.toLowerCase().includes(term)))
      )
      .map(q => ({
        content: q.content,
        author: q.author,
        tags: q.tags || [],
        id: q._id
      }));
  }

  static getTotalQuoteCount() {
    return this.totalQuotes;
  }

  static getMetadata() {
    return quotesData.metadata;
  }
}

export default QuoteService; 