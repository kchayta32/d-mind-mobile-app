package com.dmind.app.ui.screens.survey

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.spring
import androidx.compose.animation.fadeIn
import androidx.compose.animation.scaleIn
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.RateReview
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.StarBorder
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dmind.app.R
import com.dmind.app.ui.components.DmindCard
import com.dmind.app.ui.components.ScreenHeader
import com.dmind.app.ui.components.WatchYellow
import com.dmind.app.ui.viewmodel.SatisfactionSurveyUiState

@Composable
fun SatisfactionSurveyScreen(
    state: SatisfactionSurveyUiState,
    onSubmit: (rating: Int, comments: String?, userType: String) -> Unit,
    onClearSuccess: () -> Unit,
) {
    var rating by rememberSaveable { mutableIntStateOf(5) }
    var comments by rememberSaveable { mutableStateOf("") }
    var userType by rememberSaveable { mutableStateOf("general") }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .statusBarsPadding()
    ) {
        if (state.isSuccess) {
            // Premium thank you screen with spring scale-in animation
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                AnimatedVisibility(
                    visible = true,
                    enter = fadeIn() + scaleIn(
                        animationSpec = spring(
                            dampingRatio = Spring.DampingRatioMediumBouncy,
                            stiffness = Spring.StiffnessLow
                        )
                    )
                ) {
                    Icon(
                        imageVector = Icons.Filled.CheckCircle,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.size(96.dp)
                    )
                }
                Spacer(Modifier.height(20.dp))
                Text(
                    text = stringResource(R.string.survey_thank_you_title),
                    fontWeight = FontWeight.ExtraBold,
                    fontSize = 22.sp,
                    textAlign = TextAlign.Center
                )
                Spacer(Modifier.height(10.dp))
                Text(
                    text = stringResource(R.string.survey_thank_you_message),
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    fontSize = 14.sp,
                    textAlign = TextAlign.Center
                )
                Spacer(Modifier.height(30.dp))
                Button(
                    onClick = {
                        onClearSuccess()
                        rating = 5
                        comments = ""
                        userType = "general"
                    },
                    shape = RoundedCornerShape(14.dp)
                ) {
                    Text(stringResource(R.string.btn_back_to_settings))
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(bottom = 92.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                item {
                    ScreenHeader(
                        title = stringResource(R.string.nav_satisfaction_survey),
                        subtitle = stringResource(R.string.survey_screen_subtitle),
                        icon = Icons.Filled.RateReview
                    )
                }

                item {
                    DmindCard(modifier = Modifier.padding(horizontal = 18.dp)) {
                        Text(
                            text = stringResource(R.string.survey_rating_prompt),
                            fontWeight = FontWeight.Bold,
                            fontSize = 16.sp
                        )

                        // Beautiful Star Rating Row
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 12.dp),
                            horizontalArrangement = Arrangement.Center,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            (1..5).forEach { index ->
                                val isSelected = index <= rating
                                Icon(
                                    imageVector = if (isSelected) Icons.Filled.Star else Icons.Filled.StarBorder,
                                    contentDescription = "$index Stars",
                                    tint = if (isSelected) WatchYellow else MaterialTheme.colorScheme.outlineVariant,
                                    modifier = Modifier
                                        .size(48.dp)
                                        .clickable { rating = index }
                                        .padding(4.dp)
                                )
                            }
                        }

                        // Rating Label Description
                        val ratingLabel = when (rating) {
                            1 -> R.string.rating_very_poor
                            2 -> R.string.rating_poor
                            3 -> R.string.rating_fair
                            4 -> R.string.rating_good
                            else -> R.string.rating_excellent
                        }
                        Text(
                            text = stringResource(ratingLabel),
                            color = MaterialTheme.colorScheme.primary,
                            fontWeight = FontWeight.Bold,
                            fontSize = 15.sp,
                            modifier = Modifier.align(Alignment.CenterHorizontally)
                        )

                        Spacer(Modifier.height(10.dp))

                        // User Type Select
                        Text(
                            text = stringResource(R.string.survey_user_type_prompt),
                            fontWeight = FontWeight.SemiBold,
                            fontSize = 14.sp
                        )
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            val roles = listOf(
                                "general" to R.string.role_general,
                                "victim" to R.string.role_victim,
                                "helper" to R.string.role_helper
                            )
                            roles.forEach { (key, labelRes) ->
                                FilterChip(
                                    selected = userType == key,
                                    onClick = { userType = key },
                                    label = { Text(stringResource(labelRes)) },
                                    modifier = Modifier.weight(1f)
                                )
                            }
                        }

                        Spacer(Modifier.height(10.dp))

                        OutlinedTextField(
                            value = comments,
                            onValueChange = { comments = it },
                            label = { Text(stringResource(R.string.survey_comments_label)) },
                            placeholder = { Text(stringResource(R.string.survey_comments_placeholder)) },
                            modifier = Modifier.fillMaxWidth(),
                            minLines = 4
                        )

                        Spacer(Modifier.height(10.dp))

                        Button(
                            onClick = {
                                onSubmit(rating, comments.ifBlank { null }, userType)
                            },
                            modifier = Modifier.fillMaxWidth(),
                            enabled = !state.isSubmitting,
                            shape = RoundedCornerShape(14.dp)
                        ) {
                            if (state.isSubmitting) {
                                CircularProgressIndicator(modifier = Modifier.padding(end = 10.dp), strokeWidth = 2.dp)
                            }
                            Text(stringResource(R.string.btn_submit_survey))
                        }

                        if (!state.errorMessage.isNullOrBlank()) {
                            Text(
                                text = state.errorMessage,
                                color = MaterialTheme.colorScheme.error,
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
            }
        }
    }
}
