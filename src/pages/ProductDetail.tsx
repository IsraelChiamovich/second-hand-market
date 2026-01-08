import { useParams, Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, User, Phone, MessageCircle, ArrowRight, Loader2 } from "lucide-react";
import { useProduct } from "@/hooks/useProducts";
import { useState } from "react";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading, error } = useProduct(id || "");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("he-IL", {
      style: "currency",
      currency: "ILS",
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center">
          <Card className="w-full max-w-md mx-4 text-center">
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-2">המוצר לא נמצא</h2>
              <p className="text-muted-foreground mb-4">המוצר שחיפשתם לא קיים או הוסר</p>
              <Button onClick={() => navigate("/")}>חזרה לדף הבית</Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const images = product.images || [];
  const profile = product.profiles as { full_name?: string; phone?: string; avatar_url?: string } | null;

  return (
    <Layout>
      <div className="py-6 md:py-10">
        <div className="container-main">
          {/* Back Button */}
          <Button
            variant="ghost"
            className="mb-4 gap-2"
            onClick={() => navigate(-1)}
          >
            <ArrowRight className="h-4 w-4" />
            חזרה
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="aspect-square rounded-xl overflow-hidden bg-muted">
                {images.length > 0 ? (
                  <img
                    src={images[currentImageIndex]}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    אין תמונה
                  </div>
                )}
              </div>

              {images.length > 1 && (
                <div className="flex gap-3">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                        index === currentImageIndex
                          ? "border-primary"
                          : "border-transparent hover:border-border"
                      }`}
                    >
                      <img src={img} alt={`תמונה ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  {product.title}
                </h1>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{product.location}</span>
                </div>
              </div>

              <div className="text-3xl font-bold text-primary">
                {formatPrice(product.price)}
              </div>

              {product.description && (
                <div>
                  <h3 className="font-semibold mb-2">תיאור</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Seller Info */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3">פרטי המוכר</h3>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      {profile?.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt={profile.full_name || "מוכר"}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{profile?.full_name || "משתמש"}</p>
                      {profile?.phone && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {profile.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Button */}
              <Button size="lg" className="w-full gap-2">
                <MessageCircle className="h-5 w-5" />
                יצירת קשר עם המוכר
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;