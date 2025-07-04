import WidgetKit
import SwiftUI

struct QuoteData: Codable {
    let content: String
    let author: String
    let lastUpdate: String?
    
    static let placeholder = QuoteData(
        content: "Loading inspiration...",
        author: "Quotify",
        lastUpdate: nil
    )
}

struct Provider: TimelineProvider {
    private let appGroupId = "group.com.dhruvchheda.quotify.widgets"
    private let widgetQuoteKey = "widget_quote"
    private let widgetAuthorKey = "widget_author"
    
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date(), quote: QuoteData.placeholder)
    }

    func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> ()) {
        print("QuotifyWidget: Getting snapshot")
        let quote = getStoredQuote() ?? QuoteData.placeholder
        let entry = SimpleEntry(date: Date(), quote: quote)
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        print("QuotifyWidget: Getting timeline")
        Task {
            let quote = await fetchQuote()
            let currentDate = Date()
            
            // Create timeline entries
            var entries: [SimpleEntry] = []
            
            // Current quote
            entries.append(SimpleEntry(date: currentDate, quote: quote))
            
            // Update every 30 minutes
            let nextUpdate = Calendar.current.date(byAdding: .minute, value: 30, to: currentDate)!
            let nextQuote = await fetchQuote()
            entries.append(SimpleEntry(date: nextUpdate, quote: nextQuote))
            
            let timeline = Timeline(entries: entries, policy: .atEnd)
            completion(timeline)
        }
    }
    
    private func getStoredQuote() -> QuoteData? {
        print("QuotifyWidget: Getting stored quote")
        
        // Try to read from App Group first (for shared data with React Native app)
        if let userDefaults = UserDefaults(suiteName: appGroupId) {
            let content = userDefaults.string(forKey: widgetQuoteKey) ?? ""
            let author = userDefaults.string(forKey: widgetAuthorKey) ?? ""
            let lastUpdate = userDefaults.string(forKey: "widget_last_update")
            
            print("QuotifyWidget: App Group data - Quote: \(content), Author: \(author)")
            
            if !content.isEmpty && !author.isEmpty {
                return QuoteData(content: content, author: author, lastUpdate: lastUpdate)
            }
        }
        
        // Fallback to standard UserDefaults
        let content = UserDefaults.standard.string(forKey: widgetQuoteKey) ?? ""
        let author = UserDefaults.standard.string(forKey: widgetAuthorKey) ?? ""
        let lastUpdate = UserDefaults.standard.string(forKey: "widget_last_update")
        
        print("QuotifyWidget: Standard UserDefaults - Quote: \(content), Author: \(author)")
        
        if !content.isEmpty && !author.isEmpty {
            return QuoteData(content: content, author: author, lastUpdate: lastUpdate)
        }
        
        print("QuotifyWidget: No stored quote found")
        return nil
    }
    
    private func storeQuote(_ quote: QuoteData) {
        let timestamp = ISO8601DateFormatter().string(from: Date())
        
        print("QuotifyWidget: Storing quote - \(quote.content) by \(quote.author)")
        
        // Store in App Group if available
        if let userDefaults = UserDefaults(suiteName: appGroupId) {
            userDefaults.set(quote.content, forKey: widgetQuoteKey)
            userDefaults.set(quote.author, forKey: widgetAuthorKey)
            userDefaults.set(timestamp, forKey: "widget_last_update")
            userDefaults.synchronize()
            print("QuotifyWidget: Stored in App Group")
        } else {
            print("QuotifyWidget: Failed to access App Group")
        }
        
        // Also store in standard UserDefaults as fallback
        UserDefaults.standard.set(quote.content, forKey: widgetQuoteKey)
        UserDefaults.standard.set(quote.author, forKey: widgetAuthorKey)
        UserDefaults.standard.set(timestamp, forKey: "widget_last_update")
        UserDefaults.standard.synchronize()
        print("QuotifyWidget: Stored in standard UserDefaults")
    }
    
    private func fetchQuote() async -> QuoteData {
        print("QuotifyWidget: Fetching quote")
        // Try to fetch from local JSON file, fallback to stored or default
        if let localQuote = fetchQuoteFromLocalFile() {
            storeQuote(localQuote)
            return localQuote
        }
        
        if let storedQuote = getStoredQuote() {
            print("QuotifyWidget: Using stored quote")
            return storedQuote
        }
        
        print("QuotifyWidget: Using fallback quote")
        return getRandomFallbackQuote()
    }
    
    private func fetchQuoteFromLocalFile() -> QuoteData? {
        print("QuotifyWidget: Fetching from local JSON file")
        
        guard let path = Bundle.main.path(forResource: "quotes", ofType: "json"),
              let data = try? Data(contentsOf: URL(fileURLWithPath: path)) else {
            print("QuotifyWidget: Failed to load local JSON file")
            return nil
        }
        
        do {
            if let json = try JSONSerialization.jsonObject(with: data) as? [String: Any],
               let quotes = json["quotes"] as? [[String: Any]],
               !quotes.isEmpty {
                
                let randomIndex = Int.random(in: 0..<quotes.count)
                let selectedQuote = quotes[randomIndex]
                
                if let content = selectedQuote["content"] as? String,
                   let author = selectedQuote["author"] as? String,
                   !content.isEmpty, !author.isEmpty {
                    print("QuotifyWidget: Got quote from local file: \(content) by \(author)")
                    return QuoteData(content: content, author: author, lastUpdate: nil)
                }
            }
        } catch {
            print("QuotifyWidget: Error parsing local JSON file: \(error)")
        }
        
        return nil
    }
    
    private func getRandomFallbackQuote() -> QuoteData {
        let fallbackQuotes = [
            QuoteData(content: "The only way to do great work is to love what you do.", author: "Steve Jobs", lastUpdate: nil),
            QuoteData(content: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs", lastUpdate: nil),
            QuoteData(content: "Life is what happens to you while you're busy making other plans.", author: "John Lennon", lastUpdate: nil),
            QuoteData(content: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt", lastUpdate: nil),
            QuoteData(content: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle", lastUpdate: nil),
            QuoteData(content: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill", lastUpdate: nil)
        ]
        
        return fallbackQuotes.randomElement() ?? QuoteData.placeholder
    }
}

struct SimpleEntry: TimelineEntry {
    let date: Date
    let quote: QuoteData
}

struct QuotifyWidgetEntryView : View {
    var entry: Provider.Entry
    @Environment(\.widgetFamily) var family

    var body: some View {
        GeometryReader { geometry in
            ZStack {
                // Gradient background
                LinearGradient(
                    gradient: Gradient(colors: [
                        Color(red: 0.4, green: 0.49, blue: 0.92),
                        Color(red: 0.46, green: 0.29, blue: 0.64),
                        Color(red: 0.94, green: 0.58, blue: 0.98)
                    ]),
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .cornerRadius(16)
                
                VStack(alignment: .center, spacing: 8) {
                    Spacer()
                    
                    // Quote text
                    Text(entry.quote.content)
                        .font(.system(size: family == .systemSmall ? 14 : 16, weight: .medium, design: .default))
                        .foregroundColor(.white)
                        .multilineTextAlignment(.center)
                        .lineLimit(family == .systemSmall ? 4 : 6)
                        .padding(.horizontal, 16)
                    
                    // Author
                    Text("— \(entry.quote.author)")
                        .font(.system(size: family == .systemSmall ? 12 : 14, weight: .light, design: .default))
                        .foregroundColor(.white.opacity(0.9))
                        .multilineTextAlignment(.center)
                        .lineLimit(2)
                        .padding(.horizontal, 16)
                        .italic()
                    
                    Spacer()
                    
                    // Small refresh indicator
                    HStack {
                        Spacer()
                        Text("↻")
                            .font(.system(size: 10))
                            .foregroundColor(.white.opacity(0.6))
                        Text("Quotify")
                            .font(.system(size: 8, weight: .light))
                            .foregroundColor(.white.opacity(0.6))
                    }
                    .padding(.horizontal, 12)
                    .padding(.bottom, 8)
                }
            }
            .containerBackground(.fill.tertiary, for: .widget)
        }
    }
}

struct QuotifyWidget: Widget {
    let kind: String = "QuotifyWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            QuotifyWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Quotify")
        .description("Display inspiring quotes on your home screen")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

struct QuotifyWidget_Previews: PreviewProvider {
    static var previews: some View {
        QuotifyWidgetEntryView(entry: SimpleEntry(date: Date(), quote: QuoteData.placeholder))
            .previewContext(WidgetPreviewContext(family: .systemSmall))
    }
} 