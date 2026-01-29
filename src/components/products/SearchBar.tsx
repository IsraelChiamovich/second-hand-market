import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { LocationSearch } from "./LocationSearch";

interface SearchBarProps {
  onSearch?: (filters: SearchFilters) => void;
  initialFilters?: Partial<SearchFilters>;
  hideCategorySelect?: boolean;
}

export interface SearchFilters {
  keyword: string;
  category: string;
  location: string;
}

const categories = [
  { value: "all", label: "כל הקטגוריות" },
  { value: "furniture", label: "ריהוט" },
  { value: "electronics", label: "אלקטרוניקה" },
  { value: "home", label: "לבית" },
  { value: "books", label: "ספרים" },
];

const SearchBar = ({ onSearch, initialFilters, hideCategorySelect }: SearchBarProps) => {
  const [filters, setFilters] = useState<SearchFilters>({
    keyword: initialFilters?.keyword || "",
    category: initialFilters?.category || "all",
    location: initialFilters?.location || "",
  });

  // Update filters when initialFilters change
  useEffect(() => {
    if (initialFilters) {
      setFilters(prev => ({
        ...prev,
        ...initialFilters,
      }));
    }
  }, [initialFilters?.category, initialFilters?.keyword, initialFilters?.location]);

  const handleSearch = () => {
    onSearch?.(filters);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleLocationChange = (location: string) => {
    setFilters(prev => ({ ...prev, location }));
  };

  return (
    <div className="bg-card rounded-2xl shadow-lg p-4 md:p-6 border border-border">
      <div className="flex flex-col md:flex-row gap-3">
        {/* Keyword Search */}
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="חפשו מוצרים..."
            className="pr-10 h-12 text-base"
            value={filters.keyword}
            onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
            onKeyPress={handleKeyPress}
          />
        </div>

        {/* Category Select - Hide on category pages */}
        {!hideCategorySelect && (
          <Select
            value={filters.category}
            onValueChange={(value) => setFilters({ ...filters, category: value })}
          >
            <SelectTrigger className="w-full md:w-44 h-12">
              <SelectValue placeholder="קטגוריה" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Location Search with autocomplete */}
        <LocationSearch
          value={filters.location}
          onChange={handleLocationChange}
          placeholder="חפש מיקום..."
          className="w-full md:w-48"
        />

        {/* Search Button */}
        <Button onClick={handleSearch} className="h-12 px-8 text-base">
          חיפוש
        </Button>
      </div>
    </div>
  );
};

export default SearchBar;
