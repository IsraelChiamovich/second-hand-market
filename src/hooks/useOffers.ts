import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export type OfferStatus = "pending" | "accepted" | "rejected";

export interface Offer {
  id: string;
  created_at: string;
  product_id: string;
  buyer_id: string;
  seller_id: string;
  amount: number;
  status: OfferStatus;
  message?: string;
  buyer?: { full_name: string; avatar_url: string };
  product?: { title: string; price: number };
}

export const useOffers = (productId?: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["offers", productId],
    queryFn: async () => {
      let query = supabase
        .from("offers" as any)
        .select(`
          *,
          buyer:buyer_id(full_name, avatar_url),
          product:product_id(title, price)
        `)
        .order("created_at", { ascending: false });

      if (productId) {
        query = query.eq("product_id", productId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as any[];
    },
  });

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("offers-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "offers" as any },
        () => {
          queryClient.invalidateQueries({ queryKey: ["offers"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
};

export const useCreateOffer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      sellerId,
      amount,
      message,
    }: {
      productId: string;
      sellerId: string;
      amount: number;
      message?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("offers" as any)
        .insert({
          product_id: productId,
          seller_id: sellerId,
          buyer_id: user.id,
          amount,
          message,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
    },
  });
};

export const useUpdateOfferStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      offerId,
      status,
    }: {
      offerId: string;
      status: OfferStatus;
    }) => {
      const { data, error } = await supabase
        .from("offers" as any)
        .update({ status })
        .eq("id", offerId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
    },
  });
};
