export interface MediaItem {
  id: string | number;
  name: string;
  type: string; // "image/png", "video/mp4", "image/svg+xml"
  url: string;
}

export interface UserItem {
  first_name: string;
  last_name: string;
}

export interface AnnouncementLike {
  id: number | string;
  liked_by: number;
  reaction_name: string;
  created_at?: string;
  User?: UserItem;
}

export interface CreatedByUser {
  id: number | string;
  first_name: string;
  last_name: string;
  image_url?: string | null;
  profile_color?: string;
}

export interface Announcement {
  id: number | string;
  createdByUser?: CreatedByUser;
  created_at: string;
  subject: string;
  description: string;
  document_urls?: MediaItem[];
  total_likes?: number;             // ✅ optional (backend might omit)
  total_comments?: number;          // ✅ optional
  AnnouncementLikes?: AnnouncementLike[];
  reactions_count?: Record<string, number>; // ✅ better typing
}