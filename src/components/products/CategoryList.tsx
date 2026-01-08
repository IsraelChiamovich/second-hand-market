import { Link } from "react-router-dom";
import { Sofa, Laptop, Home, BookOpen, LucideIcon } from "lucide-react";

interface Category {
  id: string;
  name: string;
  icon: LucideIcon;
  count: number;
}

const categories: Category[] = [
  { id: "furniture", name: "ריהוט", icon: Sofa, count: 234 },
  { id: "electronics", name: "אלקטרוניקה", icon: Laptop, count: 189 },
  { id: "home", name: "לבית", icon: Home, count: 156 },
  { id: "books", name: "ספרים", icon: BookOpen, count: 312 },
];

const CategoryList = () => {
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
              {category.count} מוצרים
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default CategoryList;