import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { Upload as UploadIcon, X, ImagePlus, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCreateProduct } from "@/hooks/useProducts";
import { uploadProductImage } from "@/lib/storage";
import { toast } from "sonner";
import type { ProductCategory } from "@/types/database";

const categories = [
  { value: "furniture", label: "ריהוט" },
  { value: "electronics", label: "אלקטרוניקה" },
  { value: "home", label: "לבית" },
  { value: "books", label: "ספרים" },
];

const locations = [
  { value: "תל אביב", label: "תל אביב" },
  { value: "ירושלים", label: "ירושלים" },
  { value: "חיפה", label: "חיפה" },
  { value: "באר שבע", label: "באר שבע" },
  { value: "נתניה", label: "נתניה" },
  { value: "ראשון לציון", label: "ראשון לציון" },
];

const Upload = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const createProduct = useCreateProduct();
  
  const [formData, setFormData] = useState({
    title: "",
    category: "" as ProductCategory | "",
    price: "",
    description: "",
    location: "",
  });
  
  const [images, setImages] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (images.length + files.length > 3) {
      toast.error("ניתן להעלות עד 3 תמונות");
      return;
    }

    const newImages = [...images, ...files].slice(0, 3);
    setImages(newImages);

    // Create previews
    const previews = newImages.map((file) => URL.createObjectURL(file));
    setImagePreview(previews);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreview.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreview(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("יש להתחבר כדי לפרסם מודעה");
      navigate("/login");
      return;
    }

    if (!formData.category) {
      toast.error("יש לבחור קטגוריה");
      return;
    }

    if (!formData.location) {
      toast.error("יש לבחור מיקום");
      return;
    }

    if (images.length === 0) {
      toast.error("יש להעלות לפחות תמונה אחת");
      return;
    }

    setIsUploading(true);

    try {
      // Upload images first
      const imageUrls = await Promise.all(
        images.map((file) => uploadProductImage(file, user.id))
      );

      // Create product
      await createProduct.mutateAsync({
        title: formData.title,
        description: formData.description || undefined,
        price: parseFloat(formData.price),
        category: formData.category as ProductCategory,
        location: formData.location,
        images: imageUrls,
      });

      toast.success("המודעה פורסמה בהצלחה!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "שגיאה בפרסום המודעה");
    } finally {
      setIsUploading(false);
    }
  };

  if (authLoading) {
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
              <CardDescription>
                כדי לפרסם מודעה יש להתחבר לחשבון
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/login")}>התחברות</Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-8 md:py-12">
        <div className="container-main max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">פרסום מודעה חדשה</CardTitle>
              <CardDescription>
                מלאו את הפרטים והעלו תמונות של הפריט למכירה
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Images Upload */}
                <div className="space-y-3">
                  <Label>תמונות (עד 3)</Label>
                  <div className="grid grid-cols-3 gap-4">
                    {imagePreview.map((src, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                        <img src={src} alt={`תמונה ${index + 1}`} className="w-full h-full object-cover" />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 left-2 h-7 w-7"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {images.length < 3 && (
                      <label className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary cursor-pointer flex flex-col items-center justify-center gap-2 transition-colors">
                        <ImagePlus className="h-8 w-8 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">הוסף תמונה</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
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
                    placeholder="תארו את הפריט בקצרה"
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
                    placeholder="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    dir="ltr"
                  />
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label>מיקום</Label>
                  <Select
                    value={formData.location}
                    onValueChange={(value) => setFormData({ ...formData, location: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="בחרו מיקום" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((loc) => (
                        <SelectItem key={loc.value} value={loc.value}>
                          {loc.label}
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
                    placeholder="הוסיפו פרטים נוספים על הפריט..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                  />
                </div>

                <Button type="submit" className="w-full gap-2" disabled={isUploading}>
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      מפרסם...
                    </>
                  ) : (
                    <>
                      <UploadIcon className="h-4 w-4" />
                      פרסום מודעה
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

export default Upload;