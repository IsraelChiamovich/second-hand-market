import { Offer, useUpdateOfferStatus } from "@/hooks/useOffers";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, X } from "lucide-react";
import { toast } from "sonner";

interface OffersListProps {
  offers: Offer[];
  isSeller: boolean;
}

export const OffersList = ({ offers, isSeller }: OffersListProps) => {
  const updateStatus = useUpdateOfferStatus();

  const handleStatusUpdate = async (offerId: string, status: "accepted" | "rejected") => {
    try {
      await updateStatus.mutateAsync({ offerId, status });
      toast.success(status === "accepted" ? "ההצעה התקבלה" : "ההצעה נדחתה");
    } catch (error) {
      toast.error("שגיאה בעדכון הסטטוס");
    }
  };

  if (!offers.length) return null;

  return (
    <div className="space-y-4 mt-4">
      <h3 className="font-semibold text-lg">הצעות מחיר</h3>
      {offers.map((offer) => (
        <Card key={offer.id} className="p-4 flex items-center justify-between bg-muted/50">
          <div>
            <div className="font-medium">
              ₪{offer.amount}
              {offer.status === "pending" && <span className="mr-2 text-sm text-yellow-600">(ממתין)</span>}
              {offer.status === "accepted" && <span className="mr-2 text-sm text-green-600">(התקבל)</span>}
              {offer.status === "rejected" && <span className="mr-2 text-sm text-red-600">(נדחה)</span>}
            </div>
            <div className="text-sm text-muted-foreground">
              {isSeller ? `מאת: ${offer.buyer?.full_name || "משתמש"}` : `עבור: ${offer.product?.title}`}
            </div>
            {offer.message && <div className="text-sm mt-1">"{offer.message}"</div>}
          </div>
          
          {isSeller && offer.status === "pending" && (
            <div className="flex gap-2">
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                onClick={() => handleStatusUpdate(offer.id, "accepted")}
                title="קבל הצעה"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => handleStatusUpdate(offer.id, "rejected")}
                title="דחה הצעה"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};
