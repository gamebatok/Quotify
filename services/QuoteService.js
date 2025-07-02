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

  static getRandomQuoteByTag(tag) {
    const filteredQuotes = this.quotes.filter(q => 
      q.tags && q.tags.some(t => t.toLowerCase() === tag.toLowerCase())
    );
    
    if (filteredQuotes.length === 0) {
      return null;
    }
    
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const selectedQuote = filteredQuotes[randomIndex];
    
    return {
      content: selectedQuote.content,
      author: selectedQuote.author,
      tags: selectedQuote.tags || [],
      id: selectedQuote._id
    };
  }

  static getRandomQuoteByTags(tags) {
    if (!tags || tags.length === 0) {
      return this.getRandomQuote();
    }
    
    const filteredQuotes = this.quotes.filter(q => 
      q.tags && tags.some(tag => 
        q.tags.some(t => t.toLowerCase() === tag.toLowerCase())
      )
    );
    
    if (filteredQuotes.length === 0) {
      return null;
    }
    
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const selectedQuote = filteredQuotes[randomIndex];
    
    return {
      content: selectedQuote.content,
      author: selectedQuote.author,
      tags: selectedQuote.tags || [],
      id: selectedQuote._id
    };
  }

  static getAllTags() {
    const tagSet = new Set();
    this.quotes.forEach(quote => {
      if (quote.tags) {
        quote.tags.forEach(tag => tagSet.add(tag));
      }
    });
    return Array.from(tagSet).sort();
  }

  static getTagsWithCount() {
    const tagCount = {};
    this.quotes.forEach(quote => {
      if (quote.tags) {
        quote.tags.forEach(tag => {
          tagCount[tag] = (tagCount[tag] || 0) + 1;
        });
      }
    });
    
    return Object.entries(tagCount)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
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