import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  StatusBar,
  TouchableOpacity,
  Text,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import QuoteCard from './QuoteCard';
import FavoritesScreen from './FavoritesScreen';
import WidgetService from '../services/WidgetService';

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

const QuoteGenerator = () => {
  const [quote, setQuote] = useState('');
  const [author, setAuthor] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('main'); // 'main' or 'favorites'

  const getRandomFallbackQuote = () => {
    const randomIndex = Math.floor(Math.random() * fallbackQuotes.length);
    return fallbackQuotes[randomIndex];
  };

  const fetchRandomQuote = async () => {
    setLoading(true);
    try {
      console.log('Attempting to fetch quote from API...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      // Try multiple quote APIs for better reliability
      let quoteData = null;
      
      // Primary API: ZenQuotes
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
        console.log('ZenQuotes failed, trying backup API...');
      }
      
      // Backup API: Try Quotable if ZenQuotes fails
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
          console.log('Quotable API also failed:', quotableError.message);
        }
      }
      
      clearTimeout(timeoutId);
      console.log('Quote data received:', quoteData);
      
      if (quoteData && quoteData.content && quoteData.author) {
        setQuote(quoteData.content);
        setAuthor(quoteData.author);
        setIsOffline(false);
        
        // Update widget with new quote
        await WidgetService.updateWidgetData();
      } else {
        throw new Error('No valid quote data received from any API');
      }
    } catch (error) {
      console.error('Detailed error:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      
      // Use a random fallback quote
      const fallbackQuote = getRandomFallbackQuote();
      setQuote(fallbackQuote.content);
      setAuthor(fallbackQuote.author);
      setIsOffline(true);
      
      if (error.name !== 'AbortError') {
        Alert.alert(
          'Network Error',
          `Cannot connect to quote server. Using offline quotes instead.\n\nError: ${error.message}`,
          [
            { text: 'OK' },
            { 
              text: 'Retry Connection', 
              onPress: () => {
                setTimeout(fetchRandomQuote, 1000);
              }
            }
          ]
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNewQuote = async () => {
    if (isOffline) {
      // If offline, just show another random fallback quote
      const fallbackQuote = getRandomFallbackQuote();
      setQuote(fallbackQuote.content);
      setAuthor(fallbackQuote.author);
      
      // Update widget with offline quote
      await WidgetService.updateWidgetData();
    } else {
      // Try to fetch from API
      fetchRandomQuote();
    }
  };

  useEffect(() => {
    fetchRandomQuote();
  }, []);

  return (
    <View style={[styles.container, currentScreen === 'favorites' && styles.favoritesContainer]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {currentScreen === 'favorites' ? (
        <FavoritesScreen onBack={() => setCurrentScreen('main')} />
      ) : (
        <>
          {/* Favorites Button */}
          <TouchableOpacity
            style={styles.favoritesButton}
            onPress={() => setCurrentScreen('favorites')}
            activeOpacity={0.8}
          >
            <Icon name="heart" size={18} color="#FFFFFF" />
            <Text style={styles.favoritesButtonText}>Favorites</Text>
          </TouchableOpacity>

          {quote && author ? (
            <QuoteCard
              quote={quote}
              author={author}
              onNewQuote={handleNewQuote}
              loading={loading}
              isOffline={isOffline}
            />
          ) : (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FFFFFF" />
              <Text style={styles.loadingText}>Loading inspiration...</Text>
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoritesContainer: {
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  favoritesButton: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 60 : 60,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    // Platform-specific shadows
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  favoritesButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 16,
    opacity: 0.8,
    fontWeight: '500',
  },
});

export default QuoteGenerator; 