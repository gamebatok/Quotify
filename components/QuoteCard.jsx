import React, { useState } from 'react';
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

const { width } = Dimensions.get('window');

const QuoteCard = ({ quote, author, onNewQuote, loading, isOffline }) => {
  const [copySuccess, setCopySuccess] = useState(false);

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
        <Text style={styles.quoteIcon}>"</Text>
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
  quoteIcon: {
    fontSize: 60,
    color: '#6366F1',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    opacity: 0.3,
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