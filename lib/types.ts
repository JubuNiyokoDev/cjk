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
  content: string;
  image: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
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
