# Project-specific ProGuard rules for the native Android app.

# Keep the app services and receivers that can be launched by Android system
# events, notifications, WorkManager, Firebase, or explicit intents.
-keep class com.dmind.app.service.** { *; }
-keep class com.dmind.app.receiver.** { *; }
-keep class com.dmind.app.worker.** { *; }
-keep class com.dmind.app.activity.** { *; }

# Firebase Messaging
-keep class com.google.firebase.messaging.** { *; }
-dontwarn com.google.firebase.messaging.**

# MapLibre Native
-keep class org.maplibre.** { *; }
-dontwarn org.maplibre.**
-keep class com.mapbox.** { *; }
-dontwarn com.mapbox.**

# AndroidX
-dontwarn androidx.**

# Keep R classes
-keepclassmembers class **.R$* {
    public static <fields>;
}

# General metadata useful for diagnostics and reflection-based libraries.
-keepattributes *Annotation*,Signature,InnerClasses,EnclosingMethod
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

-dontwarn javax.annotation.**
-dontwarn org.conscrypt.**
-dontwarn org.bouncycastle.**
-dontwarn org.openjsse.**

-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

-keepclassmembers class * implements android.os.Parcelable {
    public static final android.os.Parcelable$Creator CREATOR;
}
