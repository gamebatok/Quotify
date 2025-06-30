import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const QuoteCard = ({ quote, author, onNewQuote, loading, isOffline }) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  // Create a unique key for each quote
  const getQuoteKey = (quote, author) => {
    return `${quote}_${author}`.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  };

  // Check if current quote is favorited
  const checkIfFavorite = async () => {
    try {
      const quoteKey = getQuoteKey(quote, author);
      const favorites = await AsyncStorage.getItem('favoriteQuotes');
      const favoritesArray = favorites ? JSON.parse(favorites) : [];
      const isAlreadyFavorite = favoritesArray.some(fav => fav.key === quoteKey);
      setIsFavorite(isAlreadyFavorite);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  // Toggle favorite status
  const toggleFavorite = async () => {
    setFavoriteLoading(true);
    try {
      const quoteKey = getQuoteKey(quote, author);
      const favorites = await AsyncStorage.getItem('favoriteQuotes');
      let favoritesArray = favorites ? JSON.parse(favorites) : [];

      if (isFavorite) {
        // Remove from favorites
        favoritesArray = favoritesArray.filter(fav => fav.key !== quoteKey);
        await AsyncStorage.setItem('favoriteQuotes', JSON.stringify(favoritesArray));
        setIsFavorite(false);
        
        Alert.alert(
          'Removed from Favorites',
          'Quote has been removed from your favorites',
          [{ text: 'OK' }],
          { cancelable: true }
        );
      } else {
        // Add to favorites
        const newFavorite = {
          key: quoteKey,
          quote,
          author,
          dateAdded: new Date().toISOString(),
        };
        favoritesArray.push(newFavorite);
        await AsyncStorage.setItem('favoriteQuotes', JSON.stringify(favoritesArray));
        setIsFavorite(true);
        
        Alert.alert(
          'Added to Favorites',
          'Quote has been saved to your favorites',
          [{ text: 'OK' }],
          { cancelable: true }
        );
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert(
        'Error',
        'Unable to save favorite. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setFavoriteLoading(false);
    }
  };

  // Check favorite status when quote changes
  useEffect(() => {
    if (quote && author) {
      checkIfFavorite();
    }
  }, [quote, author]);

  const copyToClipboard = async () => {
    try {
      const textToCopy = `"${quote}"\n\n— ${author}`;
      await Clipboard.setString(textToCopy);
      
      // Show success feedback
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      
      // Optional: Show alert for confirmation
      Alert.alert(
        'Copied!',
        'Quote has been copied to clipboard',
        [{ text: 'OK' }],
        { cancelable: true }
      );
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      Alert.alert(
        'Copy Failed',
        'Unable to copy quote to clipboard',
        [{ text: 'OK' }]
      );
    }
  };

  const shareQuote = async () => {
    try {
      const shareMessage = `"${quote}"\n\n— ${author}\n\nShared via Quotify ✨`;
      
      await Share.share({
        message: shareMessage,
        title: 'Inspiring Quote',
      });
    } catch (error) {
      console.error('Failed to share quote:', error);
      Alert.alert(
        'Share Failed',
        'Unable to share quote at this time',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.quoteIcon}>"</Text>
          <TouchableOpacity
            style={[styles.favoriteButton, favoriteLoading && styles.favoriteButtonDisabled]}
            onPress={toggleFavorite}
            disabled={favoriteLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.favoriteIcon}>
              {favoriteLoading ? '⏳' : isFavorite ? '❤️' : '🤍'}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.quoteText}>{quote}</Text>
        <View style={styles.authorContainer}>
          <Text style={styles.authorText}>— {author}</Text>
          {isOffline && (
            <Text style={styles.offlineText}>📱 Offline Mode</Text>
          )}
        </View>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.copyButton, copySuccess && styles.copyButtonSuccess]}
          onPress={copyToClipboard}
          activeOpacity={0.8}
        >
          <Text style={styles.copyButtonText}>
            {copySuccess ? '✓ Copied!' : '📋 Copy'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.shareButton}
          onPress={shareQuote}
          activeOpacity={0.8}
        >
          <Text style={styles.shareButtonText}>
            🔗 Share
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={onNewQuote}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Loading...' : 'New Quote'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    marginBottom: 40,
    width: width - 40,
    minHeight: 200,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  quoteIcon: {
    fontSize: 60,
    color: '#6366F1',
    fontWeight: 'bold',
    opacity: 0.3,
    flex: 1,
    textAlign: 'center',
  },
  favoriteButton: {
    padding: 5,
    borderRadius: 20,
    position: 'absolute',
    top: -10,
    right: -10,
    zIndex: 1,
  },
  favoriteButtonDisabled: {
    opacity: 0.6,
  },
  favoriteIcon: {
    fontSize: 28,
  },
  quoteText: {
    fontSize: 18,
    lineHeight: 28,
    color: '#1F2937',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 20,
  },
  authorContainer: {
    alignItems: 'flex-end',
    marginTop: 10,
  },
  authorText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  copyButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 25,
    shadowColor: '#10B981',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 90,
  },
  copyButtonSuccess: {
    backgroundColor: '#059669',
  },
  copyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  shareButton: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 25,
    shadowColor: '#F59E0B',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 90,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 25,
    paddingVertical: 16,
    borderRadius: 25,
    shadowColor: '#6366F1',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0.1,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  offlineText: {
    fontSize: 12,
    color: '#F59E0B',
    marginTop: 5,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default QuoteCard; 