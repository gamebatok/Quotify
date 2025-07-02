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
import QuoteService from '../services/QuoteService';

const QuoteGenerator = () => {
  const [quote, setQuote] = useState('');
  const [author, setAuthor] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('main'); // 'main' or 'favorites'

  const fetchRandomQuote = async () => {
    setLoading(true);
    try {
      console.log('Fetching quote from local JSON file...');
      
      // Get random quote from local JSON file
      const quoteData = QuoteService.getRandomQuote();
      
      console.log('Quote data received:', quoteData);
      
      if (quoteData && quoteData.content && quoteData.author) {
        setQuote(quoteData.content);
        setAuthor(quoteData.author);
        
        // Update widget with new quote
        await WidgetService.updateWidgetData();
      } else {
        throw new Error('No valid quote data received from local file');
      }
    } catch (error) {
      console.error('Error loading quote:', error);
      
      Alert.alert(
        'Error',
        `Failed to load quote from local file.\n\nError: ${error.message}`,
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNewQuote = async () => {
    fetchRandomQuote();
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
              isOffline={false} // Always false since we're using local data
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
    marginLeft: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    marginTop: 20,
    textAlign: 'center',
    opacity: 0.8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default QuoteGenerator; 