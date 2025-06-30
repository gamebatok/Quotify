import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  StatusBar,
  TouchableOpacity,
  Text,
} from 'react-native';
import QuoteCard from './QuoteCard';
import FavoritesScreen from './FavoritesScreen';

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

  const handleNewQuote = () => {
    if (isOffline) {
      // If offline, just show another random fallback quote
      const fallbackQuote = getRandomFallbackQuote();
      setQuote(fallbackQuote.content);
      setAuthor(fallbackQuote.author);
    } else {
      // Try to fetch from API
      fetchRandomQuote();
    }
  };

  useEffect(() => {
    fetchRandomQuote();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4F46E5" />
      
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
            <Text style={styles.favoritesButtonText}>❤️ My Favorites</Text>
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
  favoritesButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    zIndex: 1,
  },
  favoritesButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default QuoteGenerator; 