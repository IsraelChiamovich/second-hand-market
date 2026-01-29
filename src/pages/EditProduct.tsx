import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight, Save, X, ImagePlus, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProduct, useUpdateProduct } from "@/hooks/useProducts";
import { uploadProductImage, deleteProductImage } from "@/lib/storage";
import { toast } from "sonner";
import type { ProductCategory } from "@/types/database";
import { LocationPicker, LocationData } from "@/components/LocationPicker";

const categories = [
  { value: "furniture", label: "ריהוט" },
  { value: "electronics", label: "אלקטרוניקה" },
  { value: "home", label: "לבית" },
  { value: "books", label: "ספרים" },
];

const statusOptions = [
  { value: "active", label: "פעיל" },
  { value: "sold", label: "נמכר" },
];

const EditProduct = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { data: product, isLoading: productLoading } = useProduct(id || "");
  const updateProduct = useUpdateProduct();

  const [formData, setFormData] = useState({
    title: "",
    category: "" as ProductCategory | "",
    price: "",
    description: "",
    status: "active" as "active" | "sold",
  });

  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load product data
  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title,
        category: product.category,
        price: product.price.toString(),
        description: product.description || "",
        status: product.status as "active" | "sold",
      });
      setLocationData({
        formattedAddress: product.formatted_address || product.location,
        city: product.location,
        lat: product.latitude || 0,
        lng: product.longitude || 0,
      });
      setExistingImages(product.images || []);
    }
  }, [product]);

  const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalImages = existingImages.length + newImages.length + files.length;

    if (totalImages > 3) {
      toast.error("ניתן להעלות עד 3 תמונות");
      return;
    }

    const newFiles = [...newImages, ...files].slice(0, 3 - existingImages.length);
    setNewImages(newFiles);

    const previews = newFiles.map((file) => URL.createObjectURL(file));
    setNewImagePreviews(previews);
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImages(newImages.filter((_, i) => i !== index));
    setNewImagePreviews(newImagePreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !product) return;

    if (!formData.category) {
      toast.error("יש לבחור קטגוריה");
      return;
    }

    if (!locationData || !locationData.formattedAddress) {
      toast.error("יש לבחור מיקום");
      return;
    }

    const totalImages = existingImages.length + newImages.length;
    if (totalImages === 0) {
      toast.error("יש להעלות לפחות תמונה אחת");
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload new images
      const newImageUrls = await Promise.all(
        newImages.map((file) => uploadProductImage(file, user.id))
      );

      // Combine existing and new images
      const allImages = [...existingImages, ...newImageUrls];

      // Update product
      await updateProduct.mutateAsync({
        id: product.id,
        title: formData.title,
        description: formData.description || null,
        price: parseFloat(formData.price),
        category: formData.category as ProductCategory,
        location: locationData.city || locationData.formattedAddress,
        formatted_address: locationData.formattedAddress,
        latitude: locationData.lat,
        longitude: locationData.lng,
        status: formData.status,
        images: allImages,
      });

      toast.success("המודעה עודכנה בהצלחה!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "שגיאה בעדכון המודעה");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || productLoading) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center py-12">
          <Card className="w-full max-w-md mx-4 text-center">
            <CardHeader>
              <CardTitle>יש להתחבר</CardTitle>
              <CardDescription>כדי לערוך מודעה יש להתחבר לחשבון</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/login")}>התחברות</Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center py-12">
          <Card className="w-full max-w-md mx-4 text-center">
            <CardHeader>
              <CardTitle>המודעה לא נמצאה</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/dashboard")}>חזרה ללוח הבקרה</Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // Check ownership
  if (product.user_id !== user.id) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center py-12">
          <Card className="w-full max-w-md mx-4 text-center">
            <CardHeader>
              <CardTitle>אין הרשאה</CardTitle>
              <CardDescription>אין לכם הרשאה לערוך מודעה זו</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/dashboard")}>חזרה ללוח הבקרה</Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const totalImages = existingImages.length + newImages.length;

  return (
    <Layout>
      <div className="py-8 md:py-12">
        <div className="container-main max-w-2xl">
          {/* Back Button */}
          <Button
            variant="ghost"
            className="mb-4 gap-2"
            onClick={() => navigate(-1)}
          >
            <ArrowRight className="h-4 w-4" />
            חזרה
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">עריכת מודעה</CardTitle>
              <CardDescription>עדכנו את פרטי המוצר</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Images */}
                <div className="space-y-3">
                  <Label>תמונות (עד 3)</Label>
                  <div className="grid grid-cols-3 gap-4">
                    {/* Existing Images */}
                    {existingImages.map((src, index) => (
                      <div key={`existing-${index}`} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                        <img src={src} alt={`תמונה ${index + 1}`} className="w-full h-full object-cover" />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 left-2 h-7 w-7"
                          onClick={() => removeExistingImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}

                    {/* New Image Previews */}
                    {newImagePreviews.map((src, index) => (
                      <div key={`new-${index}`} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                        <img src={src} alt={`תמונה חדשה ${index + 1}`} className="w-full h-full object-cover" />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 left-2 h-7 w-7"
                          onClick={() => removeNewImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}

                    {/* Add Image Button */}
                    {totalImages < 3 && (
                      <label className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary cursor-pointer flex flex-col items-center justify-center gap-2 transition-colors">
                        <ImagePlus className="h-8 w-8 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">הוסף תמונה</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleNewImageChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">כותרת</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label>קטגוריה</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value as ProductCategory })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="בחרו קטגוריה" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <Label htmlFor="price">מחיר (₪)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    dir="ltr"
                  />
                </div>

                {/* Location */}
                <LocationPicker
                  className="space-y-2"
                  value={locationData || undefined}
                  onChange={setLocationData}
                />

                {/* Status */}
                <div className="space-y-2">
                  <Label>סטטוס</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value as "active" | "sold" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">תיאור</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                  />
                </div>

                <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      שומר...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      שמירת שינויים
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default EditProduct;
