import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Product, ProductCategory } from "@/types/database";

interface ProductFilters {
  keyword?: string;
  category?: string;
  location?: string;
}

export const useProducts = (filters?: ProductFilters) => {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (filters?.keyword) {
        // Search in both title and description
        query = query.or(`title.ilike.%${filters.keyword}%,description.ilike.%${filters.keyword}%`);
      }
      if (filters?.category && filters.category !== "all") {
        query = query.eq("category", filters.category as "furniture" | "electronics" | "home" | "books");
      }

      if (filters?.location && filters.location !== "all") {
        const locationMap: Record<string, string> = {
          "tel-aviv": "תל אביב",
          "jerusalem": "ירושלים",
          "haifa": "חיפה",
          "beer-sheva": "באר שבע",
          "netanya": "נתניה",
          "rishon": "ראשון לציון",
        };
        const hebrewLocation = locationMap[filters.location];
        if (hebrewLocation) {
          query = query.ilike("location", `%${hebrewLocation}%`);
        } else {
          query = query.ilike("location", `%${filters.location}%`);
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Product[];
    },
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      // First get the product
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      
      if (productError) throw productError;
      if (!product) return null;

      // Then get the seller profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, phone, avatar_url")
        .eq("user_id", product.user_id)
        .maybeSingle();

      return {
        ...product,
        profiles: profile || { full_name: null, phone: null, avatar_url: null }
      };
    },
    enabled: !!id,
  });
};

// Hook to get category counts for display
export const useCategoryCounts = () => {
  return useQuery({
    queryKey: ["category-counts"],
    queryFn: async () => {
      const categories = ["furniture", "electronics", "home", "books"] as const;
      const counts: Record<string, number> = {};
      
      for (const category of categories) {
        const { count, error } = await supabase
          .from("products")
          .select("*", { count: "exact", head: true })
          .eq("status", "active")
          .eq("category", category);
        
        if (!error) {
          counts[category] = count || 0;
        }
      }
      
      return counts;
    },
    staleTime: 30000, // Cache for 30 seconds
  });
};

export const useMyProducts = () => {
  return useQuery({
    queryKey: ["my-products"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("user_id", user.id)
        .neq("status", "deleted")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Product[];
    },
  });
};

interface CreateProductData {
  title: string;
  description?: string;
  price: number;
  category: ProductCategory;
  location: string;
  images: string[];
}

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productData: CreateProductData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("products")
        .insert({
          ...productData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["my-products"] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Product> & { id: string }) => {
      const { data, error } = await supabase
        .from("products")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["my-products"] });
      queryClient.invalidateQueries({ queryKey: ["product", data.id] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("products")
        .update({ status: "deleted" as const })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["my-products"] });
    },
  });
};