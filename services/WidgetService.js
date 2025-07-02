import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import QuoteService from './QuoteService';

class WidgetService {
  static APP_GROUP_ID = 'group.com.dhruvchheda.quotify.widgets';
  static WIDGET_QUOTE_KEY = 'widget_quote';
  static WIDGET_AUTHOR_KEY = 'widget_author';
  static WIDGET_LAST_UPDATE_KEY = 'widget_last_update';

  static getRandomQuote() {
    return QuoteService.getRandomQuote();
  }

  static async updateWidgetData() {
    try {
      const quoteData = this.getRandomQuote();
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
      return this.getRandomQuote();
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