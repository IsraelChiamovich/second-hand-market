import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateOffer } from "@/hooks/useOffers";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Gavel } from "lucide-react";

interface OfferDialogProps {
  productId: string;
  sellerId: string;
  productPrice: number;
  productTitle: string;
}

export const OfferDialog = ({ productId, sellerId, productPrice, productTitle }: OfferDialogProps) => {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState<string>("");
  const [message, setMessage] = useState("");
  const { user } = useAuth();
  const createOffer = useCreateOffer();

  const handleSubmit = async () => {
    if (!amount || isNaN(Number(amount))) {
      toast.error("נא להזין סכום תקין");
      return;
    }

    try {
      await createOffer.mutateAsync({
        productId,
        sellerId,
        amount: Number(amount),
        message,
      });
      toast.success("הצעת המחיר נשלחה בהצלחה");
      setOpen(false);
      setAmount("");
      setMessage("");
    } catch (error) {
      toast.error("שגיאה בשליחת ההצעה");
    }
  };

  if (!user || user.id === sellerId) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Gavel className="h-4 w-4" />
          הצעת מחיר
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>הגשת הצעת מחיר</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">
              מחיר מבוקש
            </Label>
            <Input
              id="price"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="col-span-3"
              placeholder={`מחיר נוכחי: ₪${productPrice}`}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="message" className="text-right">
              הודעה
            </Label>
            <Input
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="col-span-3"
              placeholder="הודעה למוכר (אופציונלי)"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit} disabled={createOffer.isPending}>
            {createOffer.isPending ? "שולח..." : "שליחת הצעה"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
