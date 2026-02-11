export type Member = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  quartier: string | null;
  date_naissance: string | null;
  photo: string | null;
  date_inscription: string;
  is_active_member: boolean;
  is_staff: boolean | null;
  is_superuser: boolean | null;
};

export type BlogCategory = {
  id: number;
  name: string;
  slug: string;
};

export type BlogPost = {
  id: number;
  title: string;
  slug: string;
  author: number;
  author_name: string;
  category: number;
  category_name: string;
  content_type?: string | null;
  content_type_id?: number | null;
  content: string;
  image: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  likes_count?: number;
  comments_count?: number;
  is_liked?: boolean;
};

export type NewsItem = {
  id: number;
  title: string;
  content: string;
  author: number;
  author_name: string;
  image: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type Activity = {
  id: number;
  title: string;
  description: string;
  activity_type: 'sport' | 'culture' | 'formation' | 'paix' | 'autre' | string;
  author: number;
  author_name: string;
  image: string | null;
  date_activite: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};
