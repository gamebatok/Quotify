/**
 * Quotify - Random Quote Generator
 * A beautiful React Native app that displays inspiring quotes
 */

import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import GradientBackground from './components/GradientBackground';
import QuoteGenerator from './components/QuoteGenerator';

function App(): React.JSX.Element {
  return (
    <SafeAreaView style={styles.container}>
      <GradientBackground>
        <QuoteGenerator />
      </GradientBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
