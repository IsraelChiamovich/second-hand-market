import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Layout } from "@/components/layout";
import { Home, Search, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] py-16">
        <div className="text-center">
          {/* 404 Number */}
          <div className="relative mb-8">
            <span className="text-[150px] md:text-[200px] font-bold text-muted/50 leading-none">
              404
            </span>
          </div>

          {/* Message */}
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            אופס! הדף לא נמצא
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
            הדף שחיפשת לא קיים או שהוסר. אולי הקישור שגוי?
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/">
              <Button size="lg" className="gap-2">
                <Home className="h-5 w-5" />
                חזרה לדף הבית
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" size="lg" className="gap-2">
                <Search className="h-5 w-5" />
                חיפוש מוצרים
              </Button>
            </Link>
          </div>

          {/* Back Link */}
          <button
            onClick={() => window.history.back()}
            className="mt-8 inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowRight className="h-4 w-4" />
            חזרה לדף הקודם
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
