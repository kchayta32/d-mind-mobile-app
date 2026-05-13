package com.dmind.app.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.ColorScheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val LightScheme = lightColorScheme(
    primary = Color(0xFF0F766E),
    onPrimary = Color.White,
    secondary = Color(0xFFB42318),
    onSecondary = Color.White,
    tertiary = Color(0xFF2F6FED),
    background = Color(0xFFF7FAF8),
    onBackground = Color(0xFF15201D),
    surface = Color.White,
    onSurface = Color(0xFF15201D),
    surfaceVariant = Color(0xFFE2EAE6),
    onSurfaceVariant = Color(0xFF41534C),
)

private val DarkScheme = darkColorScheme(
    primary = Color(0xFF52D6C7),
    onPrimary = Color(0xFF003B35),
    secondary = Color(0xFFFFB4AB),
    onSecondary = Color(0xFF690005),
    tertiary = Color(0xFFAFC6FF),
    background = Color(0xFF101817),
    onBackground = Color(0xFFE0E7E3),
    surface = Color(0xFF18211F),
    onSurface = Color(0xFFE0E7E3),
    surfaceVariant = Color(0xFF3F4946),
    onSurfaceVariant = Color(0xFFC0C9C5),
)

@Composable
fun DMindTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit,
) {
    val colors: ColorScheme = if (darkTheme) DarkScheme else LightScheme
    MaterialTheme(
        colorScheme = colors,
        typography = MaterialTheme.typography,
        content = content,
    )
}
