import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import QuoteService from '../services/QuoteService';

const { width } = Dimensions.get('window');

const CategoryFilter = ({ visible, onClose, selectedTags, onTagsChange }) => {
  const [tags, setTags] = useState([]);
  const [selectedTagsLocal, setSelectedTagsLocal] = useState(selectedTags || []);

  useEffect(() => {
    const allTags = QuoteService.getTagsWithCount();
    // Filter out empty tags and limit to most popular tags
    const popularTags = allTags.filter(({ tag, count }) => tag && count >= 5).slice(0, 20);
    setTags(popularTags);
  }, []);

  useEffect(() => {
    setSelectedTagsLocal(selectedTags || []);
  }, [selectedTags]);

  const toggleTag = (tag) => {
    setSelectedTagsLocal(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      } else {
        return [...prev, tag];
      }
    });
  };

  const handleApply = () => {
    onTagsChange(selectedTagsLocal);
    onClose();
  };

  const handleClear = () => {
    setSelectedTagsLocal([]);
    onTagsChange([]);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleClear}
            activeOpacity={0.7}
          >
            <Text style={styles.headerButtonText}>Clear All</Text>
          </TouchableOpacity>
          
          <Text style={styles.title}>Quote Categories</Text>
          
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleApply}
            activeOpacity={0.7}
          >
            <Text style={[styles.headerButtonText, styles.applyButton]}>Apply</Text>
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsText}>
            Select categories to filter quotes. Leave none selected to see all quotes.
          </Text>
          {selectedTagsLocal.length > 0 && (
            <Text style={styles.selectedCount}>
              {selectedTagsLocal.length} categor{selectedTagsLocal.length === 1 ? 'y' : 'ies'} selected
            </Text>
          )}
        </View>

        {/* Tags List */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.tagsContainer}
          showsVerticalScrollIndicator={false}
        >
          {tags.map(({ tag, count }) => (
            <TouchableOpacity
              key={tag}
              style={[
                styles.tagButton,
                selectedTagsLocal.includes(tag) && styles.tagButtonSelected
              ]}
              onPress={() => toggleTag(tag)}
              activeOpacity={0.7}
            >
              <View style={styles.tagContent}>
                <Text
                  style={[
                    styles.tagText,
                    selectedTagsLocal.includes(tag) && styles.tagTextSelected
                  ]}
                >
                  {tag}
                </Text>
                <Text
                  style={[
                    styles.tagCount,
                    selectedTagsLocal.includes(tag) && styles.tagCountSelected
                  ]}
                >
                  {count}
                </Text>
              </View>
              {selectedTagsLocal.includes(tag) && (
                <Icon 
                  name="checkmark-circle" 
                  size={20} 
                  color="#FFFFFF" 
                  style={styles.checkIcon}
                />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  headerButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  headerButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  applyButton: {
    fontWeight: '600',
  },
  instructionsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  selectedCount: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 4,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  tagsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  tagButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
    // Shadow
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  tagButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  tagContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    flex: 1,
  },
  tagTextSelected: {
    color: '#FFFFFF',
  },
  tagCount: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '600',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    textAlign: 'center',
  },
  tagCountSelected: {
    color: '#007AFF',
    backgroundColor: '#FFFFFF',
  },
  checkIcon: {
    marginLeft: 8,
  },
});

export default CategoryFilter; 