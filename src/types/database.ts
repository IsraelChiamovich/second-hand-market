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