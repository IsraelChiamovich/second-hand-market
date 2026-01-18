import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface AdminStats {
  total_users: number;
  total_products: number;
  products_last_7_days: number;
  products_last_30_days: number;
  total_conversations: number;
  total_messages: number;
}

export interface ProductWithOwner {
  id: string;
  title: string;
  category: string;
  price: number;
  status: string;
  is_featured: boolean;
  created_at: string;
  user_id: string;
  owner_name: string | null;
}

export const useIsAdmin = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["is-admin", user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      
      if (error) {
        console.error("Error checking admin role:", error);
        return false;
      }
      
      return !!data;
    },
    enabled: !!user,
  });
};

export const useAdminStats = () => {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_admin_stats");
      
      if (error) throw error;
      return data as unknown as AdminStats;
    },
  });
};

export const useProductsPerDay = (daysBack: number = 30) => {
  return useQuery({
    queryKey: ["products-per-day", daysBack],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_products_per_day", { 
        days_back: daysBack 
      });
      
      if (error) throw error;
      return data as { date: string; count: number }[];
    },
  });
};

export const useProductsByCategory = () => {
  return useQuery({
    queryKey: ["products-by-category"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_products_by_category");
      
      if (error) throw error;
      return data as { category: string; count: number }[];
    },
  });
};

export const useAllProductsAdmin = () => {
  return useQuery({
    queryKey: ["admin-all-products"],
    queryFn: async () => {
      const { data: products, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      
      if (error) throw error;
      
      // Fetch owner names
      const userIds = [...new Set(products.map(p => p.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", userIds);
      
      const profileMap = new Map(profiles?.map(p => [p.user_id, p.full_name]) || []);
      
      return products.map(p => ({
        ...p,
        owner_name: profileMap.get(p.user_id) || "לא ידוע"
      })) as ProductWithOwner[];
    },
  });
};

export const useToggleFeatured = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, is_featured }: { id: string; is_featured: boolean }) => {
      const { error } = await supabase
        .from("products")
        .update({ is_featured })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-all-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useAdminDeleteProduct = () => {
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
      queryClient.invalidateQueries({ queryKey: ["admin-all-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};
