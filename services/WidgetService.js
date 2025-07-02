import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Fallback quotes for offline use
const fallbackQuotes = [
  {
    content: "The only way to do great work is to love what you do.",
    author: "Steve Jobs"
  },
  {
    content: "Innovation distinguishes between a leader and a follower.",
    author: "Steve Jobs"
  },
  {
    content: "Life is what happens to you while you're busy making other plans.",
    author: "John Lennon"
  },
  {
    content: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt"
  },
  {
    content: "It is during our darkest moments that we must focus to see the light.",
    author: "Aristotle"
  },
  {
    content: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill"
  }
];

class WidgetService {
  static APP_GROUP_ID = 'group.com.dhruvchheda.quotify.widgets';
  static WIDGET_QUOTE_KEY = 'widget_quote';
  static WIDGET_AUTHOR_KEY = 'widget_author';
  static WIDGET_LAST_UPDATE_KEY = 'widget_last_update';

  static getRandomFallbackQuote() {
    const randomIndex = Math.floor(Math.random() * fallbackQuotes.length);
    return fallbackQuotes[randomIndex];
  }

  static async fetchQuoteFromAPI() {
    try {
      console.log('Fetching quote for widget...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      let quoteData = null;
      
      // Try ZenQuotes first
      try {
        const zenResponse = await fetch('https://zenquotes.io/api/random', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          signal: controller.signal,
        });
        
        if (zenResponse.ok) {
          const zenData = await zenResponse.json();
          if (zenData && zenData[0] && zenData[0].q && zenData[0].a) {
            quoteData = {
              content: zenData[0].q,
              author: zenData[0].a
            };
          }
        }
      } catch (zenError) {
        console.log('ZenQuotes failed for widget, trying backup API...');
      }
      
      // Backup API: Quotable
      if (!quoteData) {
        try {
          const quotableResponse = await fetch('http://api.quotable.io/random', {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            signal: controller.signal,
          });
          
          if (quotableResponse.ok) {
            const quotableData = await quotableResponse.json();
            if (quotableData && quotableData.content && quotableData.author) {
              quoteData = {
                content: quotableData.content,
                author: quotableData.author
              };
            }
          }
        } catch (quotableError) {
          console.log('Quotable API also failed for widget:', quotableError.message);
        }
      }
      
      clearTimeout(timeoutId);
      
      if (quoteData && quoteData.content && quoteData.author) {
        return quoteData;
      } else {
        throw new Error('No valid quote data received from any API');
      }
    } catch (error) {
      console.error('Widget quote fetch error:', error);
      // Return fallback quote
      return this.getRandomFallbackQuote();
    }
  }

  static async updateWidgetData() {
    try {
      const quoteData = await this.fetchQuoteFromAPI();
      const timestamp = new Date().toISOString();
      
      // Use AsyncStorage for both platforms
      // iOS widgets will use App Groups to access this data
      // Android widgets will read from SharedPreferences
      await AsyncStorage.setItem(this.WIDGET_QUOTE_KEY, quoteData.content);
      await AsyncStorage.setItem(this.WIDGET_AUTHOR_KEY, quoteData.author);
      await AsyncStorage.setItem(this.WIDGET_LAST_UPDATE_KEY, timestamp);
      
      console.log('Widget data updated:', quoteData);
      return quoteData;
    } catch (error) {
      console.error('Failed to update widget data:', error);
      return null;
    }
  }

  static async getWidgetData() {
    try {
      const quote = await AsyncStorage.getItem(this.WIDGET_QUOTE_KEY);
      const author = await AsyncStorage.getItem(this.WIDGET_AUTHOR_KEY);
      const lastUpdate = await AsyncStorage.getItem(this.WIDGET_LAST_UPDATE_KEY);
      
      if (quote && author) {
        return {
          content: quote,
          author: author,
          lastUpdate: lastUpdate
        };
      } else {
        // If no data exists, create initial data
        return await this.updateWidgetData();
      }
    } catch (error) {
      console.error('Failed to get widget data:', error);
      return this.getRandomFallbackQuote();
    }
  }

  static async refreshWidget() {
    try {
      const updatedData = await this.updateWidgetData();
      
      // Trigger widget refresh on both platforms
      if (Platform.OS === 'ios') {
        // iOS widgets will be updated through WidgetKit timeline
        console.log('iOS widget data updated');
      } else {
        // Android widget update will be handled by the native widget provider
        console.log('Android widget data updated');
      }
      
      return updatedData;
    } catch (error) {
      console.error('Failed to refresh widget:', error);
      return null;
    }
  }
}

export default WidgetService; 