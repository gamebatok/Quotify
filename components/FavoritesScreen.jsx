import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialDesignIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';

const FavoritesScreen = ({ onBack }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load favorites from storage
  const loadFavorites = async () => {
    try {
      setLoading(true);
      const storedFavorites = await AsyncStorage.getItem('favoriteQuotes');
      const favoritesArray = storedFavorites ? JSON.parse(storedFavorites) : [];
      // Sort by date added (newest first)
      const sortedFavorites = favoritesArray.sort((a, b) => 
        new Date(b.dateAdded) - new Date(a.dateAdded)
      );
      setFavorites(sortedFavorites);
    } catch (error) {
      console.error('Error loading favorites:', error);
      Alert.alert('Error', 'Unable to load favorites');
    } finally {
      setLoading(false);
    }
  };

  // Remove a favorite quote
  const removeFavorite = async (quoteKey) => {
    try {
      Alert.alert(
        'Remove Favorite',
        'Are you sure you want to remove this quote from favorites?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: async () => {
              const updatedFavorites = favorites.filter(fav => fav.key !== quoteKey);
              setFavorites(updatedFavorites);
              await AsyncStorage.setItem('favoriteQuotes', JSON.stringify(updatedFavorites));
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error removing favorite:', error);
      Alert.alert('Error', 'Unable to remove favorite');
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Render individual quote item
  const renderQuoteItem = ({ item }) => (
    <View style={styles.quoteItem}>
      <View style={styles.quoteContent}>
        <View style={styles.quoteHeader}>
          <MaterialDesignIcons name="format-quote-open" size={20} color="#667eea" style={styles.quoteIconSmall} />
          <Icon name="heart" size={14} color="#e74c3c" />
        </View>
        <Text style={styles.quoteText}>"{item.quote}"</Text>
        <Text style={styles.authorText}>— {item.author}</Text>
        <View style={styles.dateContainer}>
          <MaterialDesignIcons name="calendar" size={12} color="#bdc3c7" />
          <Text style={styles.dateText}>
            Saved on {formatDate(item.dateAdded)}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeFavorite(item.key)}
        activeOpacity={0.8}
      >
        <MaterialDesignIcons name="delete" size={18} color="#e74c3c" />
      </TouchableOpacity>
    </View>
  );

  // Load favorites when component mounts
  useEffect(() => {
    loadFavorites();
  }, []);

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2', '#f093fb']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Icon name="arrow-back" size={20} color="#FFFFFF" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>My Favorites</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={loadFavorites}>
            <Icon name="refresh-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {loading ? (
            <View style={styles.centerContainer}>
              <Icon name="heart-outline" size={60} color="#FFFFFF" style={styles.loadingIcon} />
              <Text style={styles.loadingText}>Loading favorites...</Text>
            </View>
          ) : favorites.length === 0 ? (
            <View style={styles.centerContainer}>
              <Icon name="heart-outline" size={80} color="#FFFFFF" style={styles.emptyIcon} />
              <Text style={styles.emptyTitle}>No Favorites Yet</Text>
              <Text style={styles.emptyText}>
                Start saving quotes by tapping the heart icon on quotes you love!
              </Text>
            </View>
          ) : (
            <FlatList
              data={favorites}
              renderItem={renderQuoteItem}
              keyExtractor={(item) => item.key}
              style={styles.list}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: Platform.OS === 'android' ? 12 : 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  refreshButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingIcon: {
    opacity: 0.8,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  emptyIcon: {
    opacity: 0.6,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.8,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  quoteItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    // Platform-specific shadows
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  quoteContent: {
    flex: 1,
    marginRight: 16,
  },
  quoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  quoteIconSmall: {
    opacity: 0.6,
  },
  quoteText: {
    fontSize: 16,
    lineHeight: 26,
    color: '#2c3e50',
    fontStyle: 'italic',
    marginBottom: 12,
    fontWeight: '400',
  },
  authorText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '600',
    marginBottom: 10,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#95a5a6',
    marginLeft: 6,
  },
  removeButton: {
    padding: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
  },
});

export default FavoritesScreen; 