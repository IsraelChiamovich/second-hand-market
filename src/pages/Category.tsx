import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout";
import { ProductGrid, SearchBar, SearchFilters } from "@/components/products";
import { useProducts } from "@/hooks/useProducts";
import { useState } from "react";
import { ChevronRight, Sofa, Laptop, Home, BookOpen } from "lucide-react";

const categoryNames: Record<string, string> = {
  furniture: "ריהוט",
  electronics: "אלקטרוניקה",
  home: "לבית",
  books: "ספרים",
};

const categoryIcons: Record<string, React.ElementType> = {
  furniture: Sofa,
  electronics: Laptop,
  home: Home,
  books: BookOpen,
};

const Category = () => {
  const { category } = useParams<{ category: string }>();
  const [filters, setFilters] = useState<SearchFilters>({
    keyword: "",
    category: category || "all",
    location: "all",
  });

  const { data: products, isLoading } = useProducts({
    ...filters,
    category: category || "all",
  });

  const handleSearch = (newFilters: SearchFilters) => {
    setFilters({ ...newFilters, category: category || "all" });
  };

  const categoryName = category ? categoryNames[category] || category : "כל הקטגוריות";
  const CategoryIcon = category ? categoryIcons[category] : null;

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
      {/* Breadcrumb */}
      <section className="bg-muted/30 py-4 border-b border-border">
        <div className="container-main">
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              דף הבית
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground rotate-180" />
            <span className="text-foreground font-medium">{categoryName}</span>
          </nav>
        </div>
      </section>

      {/* Category Header */}
      <section className="bg-gradient-to-b from-accent/50 to-background py-8 md:py-12">
        <div className="container-main">
          <div className="flex items-center gap-4 mb-6">
            {CategoryIcon && (
              <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center">
                <CategoryIcon className="h-7 w-7 text-primary-foreground" />
              </div>
            )}
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-foreground">
                {categoryName}
              </h1>
              <p className="text-muted-foreground">
                {displayProducts.length} מוצרים זמינים
              </p>
            </div>
          </div>

          <div className="max-w-4xl">
            <SearchBar onSearch={handleSearch} initialFilters={filters} hideCategorySelect />
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-8 md:py-12">
        <div className="container-main">
          {displayProducts.length === 0 && !isLoading ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                {CategoryIcon && <CategoryIcon className="h-10 w-10 text-muted-foreground" />}
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                אין מוצרים בקטגוריה זו
              </h3>
              <p className="text-muted-foreground mb-6">
                היה הראשון לפרסם מוצר בקטגוריה זו!
              </p>
              <Link
                to="/upload"
                className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
              >
                פרסום מודעה
              </Link>
            </div>
          ) : (
            <ProductGrid products={displayProducts} isLoading={isLoading} />
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Category;
