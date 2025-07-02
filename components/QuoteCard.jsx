import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
  Share,
  Animated,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Clipboard from '@react-native-clipboard/clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const QuoteCard = ({ quote, author, onNewQuote, loading, isOffline }) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [animatedValue] = useState(new Animated.Value(0));

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
        
        // Animate heart
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
        
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

  const heartScale = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.3],
  });

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.quoteIconContainer}>
            <Text style={styles.quoteIcon}>“</Text>
          </View>
          <TouchableOpacity
            style={[styles.favoriteButton, favoriteLoading && styles.favoriteButtonDisabled]}
            onPress={toggleFavorite}
            disabled={favoriteLoading}
            activeOpacity={0.8}
          >
            <Animated.View style={[{ transform: [{ scale: heartScale }] }]}>
              <Icon 
                name={isFavorite ? "heart" : "heart-outline"} 
                size={22} 
                color={isFavorite ? "#e74c3c" : "#bdc3c7"} 
              />
            </Animated.View>
          </TouchableOpacity>
        </View>
        <Text style={styles.quoteText}>{quote}</Text>
        <View style={styles.authorContainer}>
          <Text style={styles.authorText}>— {author}</Text>
          {isOffline && (
            <View style={styles.offlineContainer}>
              <Icon name="wifi-outline" size={14} color="#f39c12" />
              <Text style={styles.offlineText}>Offline Mode</Text>
            </View>
          )}
        </View>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.copyButton, copySuccess && styles.copyButtonSuccess]}
          onPress={copyToClipboard}
          activeOpacity={0.8}
        >
          <Icon 
            name={copySuccess ? "checkmark" : "copy-outline"} 
            size={16} 
            color="#FFFFFF" 
          />
          <Text style={styles.actionButtonText}>
            {copySuccess ? 'Copied!' : 'Copy'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.shareButton]}
          onPress={shareQuote}
          activeOpacity={0.8}
        >
          <Icon name="share-outline" size={16} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Share</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.newQuoteButton, loading && styles.buttonDisabled]}
          onPress={onNewQuote}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Icon name="refresh-outline" size={16} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>
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
    borderRadius: 24,
    padding: 32,
    marginBottom: 32,
    width: width - 40,
    minHeight: 220,
    justifyContent: 'center',
    // iOS Shadow
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 8,
        },
        shadowOpacity: 0.25,
        shadowRadius: 16,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  quoteIconContainer: {
    opacity: 0.6,
  },
  quoteIcon: {
    opacity: 0.4,
    fontSize: 52,
    fontWeight: 'bold',
    color: '#667eea',
  },
  favoriteButton: {
    padding: 8,
    borderRadius: 20,
  },
  favoriteButtonDisabled: {
    opacity: 0.6,
  },
  quoteText: {
    fontSize: 20,
    lineHeight: 32,
    color: '#2c3e50',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 24,
    fontWeight: '400',
    letterSpacing: 0.3,
  },
  authorContainer: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  authorText: {
    fontSize: 16,
    color: '#7f8c8d',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  offlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: '#fff3cd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  offlineText: {
    fontSize: 12,
    color: '#856404',
    fontWeight: '500',
    marginLeft: 6,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 25,
    minWidth: 100,
    justifyContent: 'center',
    // iOS Shadow
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
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  copyButton: {
    backgroundColor: '#27ae60',
  },
  copyButtonSuccess: {
    backgroundColor: '#2ecc71',
  },
  shareButton: {
    backgroundColor: '#3498db',
  },
  newQuoteButton: {
    backgroundColor: '#9b59b6',
  },
  buttonDisabled: {
    backgroundColor: '#95a5a6',
  },
});

export default QuoteCard; 