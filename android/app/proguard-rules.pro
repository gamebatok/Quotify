# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# React Native optimizations
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }

# Keep React Native Bridge
-keepclassmembers class com.facebook.react.bridge.** { *; }
-keepclassmembers class com.facebook.react.uimanager.** { *; }

# Keep JavaScript Interface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Quotify specific
-keep class com.dhruvchheda.quotify.** { *; }

# AsyncStorage
-keep class com.reactnativecommunity.asyncstorage.** { *; }

# Vector Icons
-keep class com.oblador.vectoricons.** { *; }

# React Native Linear Gradient
-keep class com.BV.LinearGradient.** { *; }

# Push Notifications
-keep class com.dieam.reactnativepushnotification.** { *; }

# Clipboard
-keep class com.reactnativecommunity.clipboard.** { *; }

# General Android optimizations
-dontwarn com.facebook.react.**
-dontwarn java.nio.file.*
-dontwarn org.codehaus.mojo.animal_sniffer.IgnoreJRERequirement

# Optimize
-optimizations !code/simplification/arithmetic,!field/*,!class/merging/*,!code/allocation/variable
-optimizationpasses 5
-allowaccessmodification
-dontpreverify

# Remove logging in release builds
-assumenosideeffects class android.util.Log {
    public static boolean isLoggable(java.lang.String, int);
    public static int v(...);
    public static int i(...);
    public static int w(...);
    public static int d(...);
    public static int e(...);
}
