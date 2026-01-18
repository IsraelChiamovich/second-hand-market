import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout";
import { ProductGrid } from "@/components/products";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
import { Heart, Loader2 } from "lucide-react";

const Favorites = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { data: favorites, isLoading } = useFavorites();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <Layout>
        <div className="container-main py-12 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  const displayProducts = (favorites || [])
    .filter(f => f.products && f.products.status === "active")
    .map((f) => ({
      id: f.products!.id,
      title: f.products!.title,
      price: f.products!.price,
      location: f.products!.location,
      image: f.products!.images?.[0] || "https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=400&h=400&fit=crop",
      category: f.products!.category,
      createdAt: f.created_at,
    }));

  return (
    <Layout>
      <div className="container-main py-8">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">המועדפים שלי</h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">אין מועדפים עדיין</h2>
            <p className="text-muted-foreground">
              לחץ על הלב במודעות שאתה אוהב כדי לשמור אותן כאן
            </p>
          </div>
        ) : (
          <ProductGrid products={displayProducts} isLoading={false} />
        )}
      </div>
    </Layout>
  );
};

export default Favorites;
