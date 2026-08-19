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

/** Couleurs de badge proposées au staff pour une catégorie d'activité. */
export type ActivityCategoryColor =
  | 'emerald'
  | 'orange'
  | 'blue'
  | 'red'
  | 'purple'
  | 'yellow'
  | 'cyan'
  | 'pink'
  | 'slate';

/** Catégorie d'activité gérée par le staff (le slug est stocké dans activity_type). */
export type ActivityCategory = {
  id: number;
  name: string;
  slug: string;
  color: ActivityCategoryColor;
  order: number;
  is_active: boolean;
};

/** Image de galerie attachée à un contenu (activité, actualité, article). */
export type ContentImage = {
  id: number;
  image: string;
  caption: string;
  order: number;
  created_at: string;
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
  images: ContentImage[];
  hashtags: string;
  hashtag_list: string[];
  external_link: string;
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
  images: ContentImage[];
  hashtags: string;
  hashtag_list: string[];
  external_link: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

/** Partenaire du CJK (géré via /api/organization/partners/). */
export type Partner = {
  id: number;
  name: string;
  country: string;
  description: string;
  logo: string | null;
  website: string;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

/** Valeur fondamentale du CJK (géré via /api/organization/values/). */
export type CoreValue = {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

/** Membre de l'équipe du CJK (géré via /api/organization/team/). */
export type TeamMember = {
  id: number;
  name: string;
  role: string;
  description: string;
  photo: string | null;
  email: string;
  phone: string;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

/** Distinction / prix reçu par le CJK (géré via /api/organization/awards/). */
export type Award = {
  id: number;
  name: string;
  description: string;
  year: string;
  icon: string;
  color: string;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

/** Élément de la galerie (photo ou vidéo). */
export type GalleryItem = {
  id: string;
  type: 'photo' | 'video' | string;
  url: string;
  thumbnail: string | null;
  title: string;
  category: string;
  height: string;
  order: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
};

/** Conversation du chatbot (historique utilisateur connecté). */
export type ChatbotConversation = {
  id: number;
  session_key: string;
  title: string;
  created_at: string;
  updated_at: string;
  messages_count: number;
};

export type ChatbotHistoryMessage = {
  id: number;
  role: 'user' | 'bot';
  content: string;
  created_at: string;
};

export type Activity = {
  id: number;
  title: string;
  description: string;
  /** Slug d'une ActivityCategory (les catégories sont gérées en base). */
  activity_type: string;
  author: number;
  author_name: string;
  image: string | null;
  images: ContentImage[];
  hashtags: string;
  hashtag_list: string[];
  external_link: string;
  date_activite: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};
