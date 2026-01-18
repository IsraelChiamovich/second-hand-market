import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Database, Check, X } from "lucide-react";
import { seedDemoData, SeedResult } from "@/lib/seedData";
import { toast } from "sonner";

const SeedDataButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SeedResult | null>(null);

  const handleSeed = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const seedResult = await seedDemoData();
      setResult(seedResult);
      if (seedResult.success) {
        toast.success(seedResult.message);
      } else {
        toast.error(seedResult.message);
      }
    } catch (error: any) {
      toast.error("שגיאה ביצירת נתוני הדגמה");
      setResult({
        success: false,
        message: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 text-xs">
          <Database className="h-3 w-3" />
          נתוני הדגמה
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>יצירת נתוני הדגמה</DialogTitle>
          <DialogDescription>
            פעולה זו תיצור 2 משתמשי הדגמה ומספר מוצרים לדוגמה לצורך בדיקת המערכת.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {result ? (
            <div className={`p-4 rounded-lg ${result.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
              <div className="flex items-start gap-3">
                {result.success ? (
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <X className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className={result.success ? "text-green-700" : "text-red-700"}>
                    {result.message}
                  </p>
                  {result.users && result.users.length > 0 && (
                    <div className="mt-3 text-sm text-muted-foreground">
                      <p className="font-medium mb-2">פרטי התחברות:</p>
                      {result.users.map((user) => (
                        <div key={user.email} className="bg-white p-2 rounded mb-1">
                          <p>שם: {user.fullName}</p>
                          <p>אימייל: {user.email}</p>
                          <p>סיסמה: demo123456</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-muted-foreground">
              <p className="mb-2">נתונים שייווצרו:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>2 משתמשי הדגמה (יוסי כהן, שרה לוי)</li>
                <li>8 מוצרים לדוגמה בקטגוריות שונות</li>
              </ul>
              <p className="mt-3 text-xs text-muted-foreground">
                סיסמת המשתמשים: demo123456
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              סגירה
            </Button>
            {!result?.success && (
              <Button onClick={handleSeed} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin ml-2" />
                    יוצר נתונים...
                  </>
                ) : (
                  "יצירת נתונים"
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SeedDataButton;
