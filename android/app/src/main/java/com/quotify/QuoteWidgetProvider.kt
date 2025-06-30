package com.quotify

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.util.Log
import android.widget.RemoteViews
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL
import kotlin.random.Random

class QuoteWidgetProvider : AppWidgetProvider() {

    companion object {
        const val ACTION_REFRESH_WIDGET = "com.quotify.REFRESH_WIDGET"
        const val WIDGET_QUOTE_KEY = "widget_quote"
        const val WIDGET_AUTHOR_KEY = "widget_author"
        const val WIDGET_LAST_UPDATE_KEY = "widget_last_update"
        
        private val fallbackQuotes = arrayOf(
            Pair("The only way to do great work is to love what you do.", "Steve Jobs"),
            Pair("Innovation distinguishes between a leader and a follower.", "Steve Jobs"),
            Pair("Life is what happens to you while you're busy making other plans.", "John Lennon"),
            Pair("The future belongs to those who believe in the beauty of their dreams.", "Eleanor Roosevelt"),
            Pair("It is during our darkest moments that we must focus to see the light.", "Aristotle"),
            Pair("Success is not final, failure is not fatal: it is the courage to continue that counts.", "Winston Churchill")
        )
    }

    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        
        Log.d("QuoteWidget", "onReceive called with action: ${intent.action}")
        
        if (ACTION_REFRESH_WIDGET == intent.action) {
            Log.d("QuoteWidget", "Refresh widget action received")
            val appWidgetManager = AppWidgetManager.getInstance(context)
            val componentName = ComponentName(context, QuoteWidgetProvider::class.java)
            val appWidgetIds = appWidgetManager.getAppWidgetIds(componentName)
            
            Log.d("QuoteWidget", "Found ${appWidgetIds.size} widgets to refresh")
            
            // Refresh all widgets
            for (appWidgetId in appWidgetIds) {
                Thread {
                    fetchAndUpdateQuote(context, appWidgetManager, appWidgetId)
                }.start()
            }
        }
    }

    private fun updateAppWidget(context: Context, appWidgetManager: AppWidgetManager, appWidgetId: Int) {
        Log.d("QuoteWidget", "Updating widget $appWidgetId")
        val views = RemoteViews(context.packageName, R.layout.quote_widget)
        
        // Set up refresh button click intent
        val refreshIntent = Intent(context, QuoteWidgetProvider::class.java).apply {
            action = ACTION_REFRESH_WIDGET
        }
        val refreshPendingIntent = PendingIntent.getBroadcast(
            context, 0, refreshIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        views.setOnClickPendingIntent(R.id.widget_refresh_button, refreshPendingIntent)
        
        // Set up main widget click to open app
        val openAppIntent = Intent(context, MainActivity::class.java)
        val openAppPendingIntent = PendingIntent.getActivity(
            context, 0, openAppIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        views.setOnClickPendingIntent(R.id.widget_quote_text, openAppPendingIntent)
        
        // Load and display quote
        val quoteData = getStoredQuote(context)
        views.setTextViewText(R.id.widget_quote_text, quoteData.first)
        views.setTextViewText(R.id.widget_author_text, "— ${quoteData.second}")
        
        appWidgetManager.updateAppWidget(appWidgetId, views)
        
        // If no quote is stored, fetch a new one
        if (quoteData.first == "Loading inspiration...") {
            Thread {
                fetchAndUpdateQuote(context, appWidgetManager, appWidgetId)
            }.start()
        }
    }

    private fun fetchAndUpdateQuote(context: Context, appWidgetManager: AppWidgetManager, appWidgetId: Int) {
        Log.d("QuoteWidget", "Fetching new quote for widget $appWidgetId")
        val quoteData = fetchQuoteFromAPI()
        
        Log.d("QuoteWidget", "Got quote: ${quoteData.first} by ${quoteData.second}")
        
        // Store the quote
        storeQuote(context, quoteData.first, quoteData.second)
        
        // Update widget UI on main thread
        val views = RemoteViews(context.packageName, R.layout.quote_widget)
        views.setTextViewText(R.id.widget_quote_text, quoteData.first)
        views.setTextViewText(R.id.widget_author_text, "— ${quoteData.second}")
        
        // Set up intents again
        val refreshIntent = Intent(context, QuoteWidgetProvider::class.java).apply {
            action = ACTION_REFRESH_WIDGET
        }
        val refreshPendingIntent = PendingIntent.getBroadcast(
            context, 0, refreshIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        views.setOnClickPendingIntent(R.id.widget_refresh_button, refreshPendingIntent)
        
        val openAppIntent = Intent(context, MainActivity::class.java)
        val openAppPendingIntent = PendingIntent.getActivity(
            context, 0, openAppIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        views.setOnClickPendingIntent(R.id.widget_quote_text, openAppPendingIntent)
        
        appWidgetManager.updateAppWidget(appWidgetId, views)
    }

    private fun fetchQuoteFromAPI(): Pair<String, String> {
        return try {
            // Try ZenQuotes first
            var quote: Pair<String, String>? = null
            
            try {
                val zenUrl = URL("https://zenquotes.io/api/random")
                val zenConnection = zenUrl.openConnection() as HttpURLConnection
                zenConnection.requestMethod = "GET"
                zenConnection.connectTimeout = 10000
                zenConnection.readTimeout = 10000
                
                if (zenConnection.responseCode == 200) {
                    val reader = BufferedReader(InputStreamReader(zenConnection.inputStream))
                    val response = reader.readText()
                    reader.close()
                    
                    val jsonArray = org.json.JSONArray(response)
                    if (jsonArray.length() > 0) {
                        val jsonObject = jsonArray.getJSONObject(0)
                        val content = jsonObject.getString("q")
                        val author = jsonObject.getString("a")
                        if (content.isNotEmpty() && author.isNotEmpty()) {
                            quote = Pair(content, author)
                        }
                    }
                }
                zenConnection.disconnect()
            } catch (e: Exception) {
                // ZenQuotes failed, try Quotable
            }
            
            // Backup API: Quotable
            if (quote == null) {
                try {
                    val quotableUrl = URL("http://api.quotable.io/random")
                    val quotableConnection = quotableUrl.openConnection() as HttpURLConnection
                    quotableConnection.requestMethod = "GET"
                    quotableConnection.connectTimeout = 10000
                    quotableConnection.readTimeout = 10000
                    
                    if (quotableConnection.responseCode == 200) {
                        val reader = BufferedReader(InputStreamReader(quotableConnection.inputStream))
                        val response = reader.readText()
                        reader.close()
                        
                        val jsonObject = JSONObject(response)
                        val content = jsonObject.getString("content")
                        val author = jsonObject.getString("author")
                        if (content.isNotEmpty() && author.isNotEmpty()) {
                            quote = Pair(content, author)
                        }
                    }
                    quotableConnection.disconnect()
                } catch (e: Exception) {
                    // Both APIs failed
                }
            }
            
            quote ?: getRandomFallbackQuote()
        } catch (e: Exception) {
            getRandomFallbackQuote()
        }
    }

    private fun getRandomFallbackQuote(): Pair<String, String> {
        val randomIndex = Random.nextInt(fallbackQuotes.size)
        return fallbackQuotes[randomIndex]
    }

    private fun storeQuote(context: Context, quote: String, author: String) {
        val sharedPreferences = context.getSharedPreferences("QuotifyWidget", Context.MODE_PRIVATE)
        val editor = sharedPreferences.edit()
        editor.putString(WIDGET_QUOTE_KEY, quote)
        editor.putString(WIDGET_AUTHOR_KEY, author)
        editor.putLong(WIDGET_LAST_UPDATE_KEY, System.currentTimeMillis())
        editor.apply()
    }

    private fun getStoredQuote(context: Context): Pair<String, String> {
        val sharedPreferences = context.getSharedPreferences("QuotifyWidget", Context.MODE_PRIVATE)
        val quote = sharedPreferences.getString(WIDGET_QUOTE_KEY, "Loading inspiration...")
        val author = sharedPreferences.getString(WIDGET_AUTHOR_KEY, "Quotify")
        return Pair(quote ?: "Loading inspiration...", author ?: "Quotify")
    }
} 