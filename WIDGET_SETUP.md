# Quotify Widget Setup Guide

## Overview
Quotify now supports beautiful home screen widgets that display inspiring quotes directly on your device's home screen. The widgets automatically update with new quotes and maintain your app's beautiful gradient design.

## Features
- **Auto-updating quotes**: Widgets refresh every 30 minutes with new inspiring quotes
- **Beautiful design**: Matches your app's gradient theme
- **Offline support**: Works even when you're offline with cached quotes
- **Cross-platform**: Available on both Android and iOS
- **Multiple sizes**: Choose from different widget sizes to fit your home screen

## Setup Instructions

### Android Setup

1. **Install the app** with the new widget functionality
2. **Add widget to home screen**:
   - Long press on your home screen
   - Select "Widgets" from the menu
   - Find "Quotify" in the widget list
   - Drag the Quotify widget to your desired location
   - Resize as needed

3. **Widget features**:
   - Tap the quote to open the main app
   - Tap the refresh button (↻) to get a new quote
   - Widget updates automatically every 30 minutes

### iOS Setup

1. **Install the app** with the new widget functionality
2. **Add widget to home screen**:
   - Long press on your home screen until apps start jiggling
   - Tap the "+" button in the top corner
   - Search for "Quotify" in the widget gallery
   - Select your preferred widget size (Small or Medium)
   - Tap "Add Widget"
   - Position the widget where you want it

3. **Widget features**:
   - Tap the widget to open the main app
   - Widget updates automatically with new quotes
   - Uses iOS WidgetKit for optimal performance

## Widget Management

### Automatic Updates
- The app automatically updates widget data when you fetch new quotes in the main app
- Widget shares the same quote API as the main app
- Widgets refresh automatically every 30 minutes

### Troubleshooting

**Widget not updating?**
- Check your internet connection
- Open the main app and fetch a new quote to sync with widgets
- On Android: Remove and re-add the widget
- On iOS: Force-close the app and reopen it

**Widget showing old quotes?**
- The widget may be using cached data
- Open the main app and fetch new quotes to sync with widgets
- Wait for the automatic 30-minute refresh cycle

**Widget not appearing?**
- Make sure you have enough space on your home screen
- Try restarting your device
- Reinstall the app if the issue persists

## Technical Details

### Data Storage
- **Android**: Uses SharedPreferences for widget data storage
- **iOS**: Uses App Groups and UserDefaults for secure data sharing
- **Offline**: Both platforms cache quotes for offline display

### Update Frequency
- **Automatic**: Every 30 minutes when connected to internet
- **Manual**: Use the app's Widget button for immediate updates
- **Background**: Widgets update in the background without opening the app

### API Integration
- Uses the same quote APIs as the main app (ZenQuotes, Quotable)
- Fallback to cached quotes when APIs are unavailable
- Respects your network settings and data usage

## Privacy & Performance

- **Privacy**: Widget data is stored locally on your device only
- **Performance**: Minimal battery impact with efficient update scheduling
- **Data Usage**: Only downloads new quotes when needed
- **Storage**: Uses minimal device storage for cached quotes

## Support

If you encounter any issues with the widgets:
1. Try the troubleshooting steps above
2. Check that you have the latest version of Quotify
3. Ensure your device supports widgets (iOS 14+ or Android 3.0+)
4. Contact support through the app if problems persist

Enjoy your inspiring quotes right on your home screen! 🌟 