import { Link } from "react-router-dom";
import { Sofa, Laptop, Home, BookOpen, LucideIcon } from "lucide-react";
import { useCategoryCounts } from "@/hooks/useProducts";

interface Category {
  id: string;
  name: string;
  icon: LucideIcon;
}

const categories: Category[] = [
  { id: "furniture", name: "ריהוט", icon: Sofa },
  { id: "electronics", name: "אלקטרוניקה", icon: Laptop },
  { id: "home", name: "לבית", icon: Home },
  { id: "books", name: "ספרים", icon: BookOpen },
];

const CategoryList = () => {
  const { data: counts, isLoading } = useCategoryCounts();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {categories.map((category) => (
        <Link
          key={category.id}
          to={`/category/${category.id}`}
          className="group bg-card border border-border rounded-xl p-6 hover:border-primary hover:shadow-lg transition-all duration-300"
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-accent rounded-xl flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <category.icon className="h-7 w-7 text-accent-foreground group-hover:text-primary-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">{category.name}</h3>
            <span className="text-sm text-muted-foreground">
              {isLoading ? "..." : `${counts?.[category.id] || 0} מוצרים`}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default CategoryList;