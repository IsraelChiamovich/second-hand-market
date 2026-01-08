import { Layout } from "@/components/layout";
import { SearchBar, ProductGrid, CategoryList, Product, SearchFilters } from "@/components/products";
import { useState } from "react";

// Mock data - would be replaced with API calls
const mockProducts: Product[] = [
  {
    id: "1",
    title: "ספה תלת מושבית אפורה במצב מעולה",
    price: 1500,
    location: "תל אביב",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop",
    category: "furniture",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    title: "אייפון 14 פרו 128GB",
    price: 3200,
    location: "ירושלים",
    image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop",
    category: "electronics",
    createdAt: "2024-01-14",
  },
  {
    id: "3",
    title: "שולחן עבודה מעץ מלא",
    price: 800,
    location: "חיפה",
    image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&h=400&fit=crop",
    category: "furniture",
    createdAt: "2024-01-13",
  },
  {
    id: "4",
    title: "אוסף ספרי בישול - 15 כרכים",
    price: 250,
    location: "נתניה",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=400&fit=crop",
    category: "books",
    createdAt: "2024-01-12",
  },
  {
    id: "5",
    title: "מכונת קפה דלונגי אוטומטית",
    price: 1800,
    location: "באר שבע",
    image: "https://images.unsplash.com/photo-1520970014086-2208d157c9e2?w=400&h=400&fit=crop",
    category: "home",
    createdAt: "2024-01-11",
  },
  {
    id: "6",
    title: "מחשב נייד Dell XPS 15",
    price: 4500,
    location: "ראשון לציון",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop",
    category: "electronics",
    createdAt: "2024-01-10",
  },
  {
    id: "7",
    title: "כורסא מעוצבת בסגנון סקנדינבי",
    price: 950,
    location: "תל אביב",
    image: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=400&fit=crop",
    category: "furniture",
    createdAt: "2024-01-09",
  },
  {
    id: "8",
    title: "סט כלי מטבח נירוסטה",
    price: 320,
    location: "חיפה",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop",
    category: "home",
    createdAt: "2024-01-08",
  },
];

const Index = () => {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = (filters: SearchFilters) => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      let filtered = [...mockProducts];
      
      if (filters.keyword) {
        filtered = filtered.filter((p) =>
          p.title.toLowerCase().includes(filters.keyword.toLowerCase())
        );
      }
      
      if (filters.category !== "all") {
        filtered = filtered.filter((p) => p.category === filters.category);
      }
      
      if (filters.location !== "all") {
        const locationMap: Record<string, string> = {
          "tel-aviv": "תל אביב",
          "jerusalem": "ירושלים",
          "haifa": "חיפה",
          "beer-sheva": "באר שבע",
          "netanya": "נתניה",
          "rishon": "ראשון לציון",
        };
        filtered = filtered.filter((p) => p.location === locationMap[filters.location]);
      }
      
      setProducts(filtered);
      setIsLoading(false);
    }, 500);
  };

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
              {products.length} מוצרים
            </span>
          </div>
          <ProductGrid products={products} isLoading={isLoading} />
        </div>
      </section>
    </Layout>
  );
};

export default Index;