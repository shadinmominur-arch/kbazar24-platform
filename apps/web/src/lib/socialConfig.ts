// Social media video config
// YouTube is auto-fetched via RSS (set YOUTUBE_CHANNEL_ID in .env.local)
// TikTok & Facebook: add video IDs/URLs here

export type VideoEntry = {
  id: string;
  title: string;
};

export type FacebookEntry = {
  videoUrl: string; // full facebook.com video URL
  title: string;
};

export type InstagramEntry = {
  href: string;
  caption: string;
  thumbnail: string;
};

// YouTube fallback (shown if RSS fails or YOUTUBE_CHANNEL_ID not set)
export const YOUTUBE_FALLBACK_VIDEOS: VideoEntry[] = [];

// TikTok videos — add video IDs from kbazar24 TikTok account when available
export const TIKTOK_VIDEOS: VideoEntry[] = [];

// Facebook reels — add from kbazar24 Facebook page when available
export const FACEBOOK_VIDEOS: FacebookEntry[] = [];

// Instagram posts — add from kbazar24 Instagram when available
export const INSTAGRAM_POSTS: InstagramEntry[] = [];
