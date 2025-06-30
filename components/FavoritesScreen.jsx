import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

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
        <Text style={styles.quoteText}>"{item.quote}"</Text>
        <Text style={styles.authorText}>— {item.author}</Text>
        <Text style={styles.dateText}>
          Saved on {formatDate(item.dateAdded)}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeFavorite(item.key)}
        activeOpacity={0.8}
      >
        <Text style={styles.removeButtonText}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );

  // Load favorites when component mounts
  useEffect(() => {
    loadFavorites();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>My Favorites</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={loadFavorites}>
          <Text style={styles.refreshButtonText}>🔄</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Loading favorites...</Text>
        </View>
      ) : favorites.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyIcon}>💭</Text>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#6366F1',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  refreshButton: {
    padding: 8,
  },
  refreshButtonText: {
    fontSize: 18,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 20,
  },
  quoteItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  quoteContent: {
    flex: 1,
    marginRight: 15,
  },
  quoteText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1F2937',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  authorText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  removeButton: {
    padding: 8,
    borderRadius: 20,
  },
  removeButtonText: {
    fontSize: 20,
  },
});

export default FavoritesScreen; 