import { Layout } from "@/components/layout";
import { SearchBar, ProductGrid, CategoryList, SearchFilters } from "@/components/products";
import { useProducts } from "@/hooks/useProducts";
import { useState } from "react";

const Index = () => {
  const [filters, setFilters] = useState<SearchFilters>({
    keyword: "",
    category: "all",
    location: "all",
  });
  
  const { data: products, isLoading } = useProducts(filters);

  const handleSearch = (newFilters: SearchFilters) => {
    setFilters(newFilters);
  };

  // Transform DB products to component format
  const displayProducts = (products || []).map((p) => ({
    id: p.id,
    title: p.title,
    price: p.price,
    location: p.location,
    image: p.images?.[0] || "https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=400&h=400&fit=crop",
    category: p.category,
    createdAt: p.created_at,
  }));

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-accent/50 to-background py-12 md:py-20">
        <div className="container-main">
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              מצאו מציאות בכל יום
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              פלטפורמה פשוטה ונוחה לקנייה ומכירה של מוצרי יד שנייה
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 md:py-16">
        <div className="container-main">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">קטגוריות</h2>
          </div>
          <CategoryList />
        </div>
      </section>

      {/* Products Grid Section */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container-main">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">מוצרים אחרונים</h2>
            <span className="text-muted-foreground text-sm">
              {displayProducts.length} מוצרים
            </span>
          </div>
          <ProductGrid products={displayProducts} isLoading={isLoading} />
        </div>
      </section>
    </Layout>
  );
};

export default Index;