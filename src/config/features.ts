/**
 * Feature flag defaults.
 * In production these can be database-driven via admin panel.
 */
export const featureFlags = {
  ENABLE_DATING: true,
  ENABLE_CAMPUS_FEED: false,
  ENABLE_EVENTS: false,
  ENABLE_VOICE_MESSAGES: false,
  ENABLE_AI_MATCHING: false,
  ENABLE_ANONYMOUS_CRUSH: false,
  // Face verification is implemented but intentionally disabled until the
  // browser engine is ready for production use.
  ENABLE_CAMERA_VERIFICATION: false,
  ENABLE_PROFILE_AUDIO: false,
  ENABLE_MEDIA_CHAT: false,
} as const;
