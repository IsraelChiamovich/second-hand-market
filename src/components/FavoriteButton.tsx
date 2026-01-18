import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useIsFavorite, useToggleFavorite } from "@/hooks/useFavorites";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  productId: string;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
}

export function FavoriteButton({ productId, className, size = "icon" }: FavoriteButtonProps) {
  const { user } = useAuth();
  const { data: isFavorite, isLoading } = useIsFavorite(productId);
  const toggleFavorite = useToggleFavorite();

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("יש להתחבר כדי לשמור מועדפים");
      return;
    }

    try {
      await toggleFavorite.mutateAsync({ productId, isFavorite: !!isFavorite });
      toast.success(isFavorite ? "הוסר מהמועדפים" : "נוסף למועדפים");
    } catch (error) {
      toast.error("שגיאה בעדכון המועדפים");
    }
  };

  return (
    <Button
      variant="ghost"
      size={size}
      className={cn(
        "hover:bg-background/80",
        isFavorite && "text-destructive",
        className
      )}
      onClick={handleClick}
      disabled={isLoading || toggleFavorite.isPending}
    >
      <Heart
        className={cn(
          "h-5 w-5 transition-all",
          isFavorite && "fill-current"
        )}
      />
    </Button>
  );
}
