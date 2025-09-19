export interface MediaItem {
  id: string | number;
  name: string;
  type: string; // "image/png", "video/mp4", "image/svg+xml"
  url: string;
}

export interface CommentItem {
  id: number | string;
  comment: string;
  created_at?: string;
  User: {
    id: number;
    first_name?: string;
    last_name?: string;
    email?: string;
    image_url?: string | null;
    profile_color?: string;
    designation?: string
  };
  updated_at?: string
}

export interface Badge {
  id: number;
  name: string;
  color?: string;
  icon?: string;
  created_at?: string;
}

export interface PraisedUser {
  id: number;
  first_name?: string;
  last_name?: string;
  email?: string;
}

export interface PollOption {
  option: string;
  count: number;
  percentage: number;
}

export interface PollAnswerResponse {
  id: number;
  user_id: number;
  option: string;
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
  type?: string;
  document_urls?: MediaItem[];
  total_likes?: number;
  total_comments?: number;
  AnnouncementLikes?: AnnouncementLike[];
  reactions_count?: Record<string, number>;
  options?: string[];
  pollResults?: PollOption[];
  answer_response?: PollAnswerResponse[];
  question?: string;
  Badge?: Badge;
  praisedUser?: PraisedUser;
  reposted_by?: number | null;
  repostedByUser?: {
    id: number;
    first_name?: string;
    last_name?: string;
    image_url?: string;
    profile_color?: string;
  };
  repost_post_created_at?: string;
  is_edited?: boolean;
  Comments?: CommentItem[];
}
