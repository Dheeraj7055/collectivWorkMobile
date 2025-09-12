// src/types/announcement.ts
export interface MediaItem {
  id: string | number;
  name: string;
  type: string;
  url: string;
}

export interface AnnouncementLike {
  id: number | string;       // allow both
  announcement_id: number | string;
  liked_by: number | string;
  reaction_name: string;
}

export interface Announcement {
  id: number | string;       // flexible for API
  subject: string;
  description: string;
  created_at: string;
  total_likes: number;
  total_comments: number;
  document_urls?: MediaItem[];
  AnnouncementLikes?: AnnouncementLike[];
  createdByUser?: {
    id: number | string;
    first_name: string;
    last_name: string;
    image_url?: string;
    profile_color?: string;
  };
}
