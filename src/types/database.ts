export type ProductCategory = 'furniture' | 'electronics' | 'home' | 'books';
export type ProductStatus = 'active' | 'sold' | 'deleted';

export interface Product {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  price: number;
  category: ProductCategory;
  location: string;
  status: ProductStatus;
  images: string[];
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductWithProfile extends Product {
  profiles?: Profile | null;
}

export interface Conversation {
  id: string;
  product_id: string | null;
  buyer_id: string;
  seller_id: string;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConversationWithDetails extends Conversation {
  products?: {
    id: string;
    title: string;
    images: string[] | null;
    price: number;
  } | null;
  buyer_profile?: Profile | null;
  seller_profile?: Profile | null;
  last_message?: Message | null;
  unread_count?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read_at: string | null;
  created_at: string;
}