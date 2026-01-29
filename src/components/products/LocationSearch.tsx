import { useState, useEffect, useCallback, useRef } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface LocationResult {
  formattedAddress: string;
  city: string;
}

interface LocationSearchProps {
  value?: string;
  onChange: (location: string) => void;
  placeholder?: string;
  className?: string;
}

type NominatimResult = {
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    state?: string;
    county?: string;
  };
};

const NOMINATIM_ENDPOINT = "https://nominatim.openstreetmap.org/search";

export function LocationSearch({ value, onChange, placeholder = "חפש מיקום...", className }: LocationSearchProps) {
  const [searchQuery, setSearchQuery] = useState(value || "");
  const [suggestions, setSuggestions] = useState<LocationResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value && value !== searchQuery) {
      setSearchQuery(value);
    }
  }, [value]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const mapResultToLocation = useCallback((result: NominatimResult): LocationResult => {
    const city =
      result.address?.city ||
      result.address?.town ||
      result.address?.village ||
      result.address?.municipality ||
      result.address?.state ||
      result.address?.county ||
      result.display_name.split(",")[0];

    return {
      formattedAddress: result.display_name,
      city,
    };
  }, []);

  const fetchSuggestions = useCallback(
    async (query: string, controller: AbortController) => {
      setIsSearching(true);

      try {
        const params = new URLSearchParams({
          q: query,
          format: "jsonv2",
          addressdetails: "1",
          limit: "5",
          countrycodes: "il",
        });

        const response = await fetch(`${NOMINATIM_ENDPOINT}?${params.toString()}`, {
          signal: controller.signal,
          headers: {
            "Accept-Language": "he",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch location suggestions");
        }

        const data = (await response.json()) as NominatimResult[];
        const mapped = data.map(mapResultToLocation);
        setSuggestions(mapped);
        setShowSuggestions(true);
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          console.error(err);
        }
      } finally {
        setIsSearching(false);
      }
    },
    [mapResultToLocation]
  );

  useEffect(() => {
    const q = searchQuery.trim();
    if (!q || q.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetchSuggestions(q, controller);
    }, 350);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery, fetchSuggestions]);

  const selectLocation = (location: LocationResult) => {
    setSearchQuery(location.city);
    setShowSuggestions(false);
    onChange(location.city);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
    if (!newValue) {
      onChange("");
    }
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          autoComplete="off"
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          className="pr-10 h-12 text-base"
        />
        {isSearching && (
          <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <Card className="absolute z-50 w-full mt-1 max-h-64 overflow-auto bg-popover border border-border shadow-lg">
          {suggestions.map((location, index) => (
            <button
              key={`${location.city}-${index}`}
              type="button"
              className="w-full px-4 py-3 text-right hover:bg-muted transition-colors flex items-center gap-2 border-b border-border last:border-b-0"
              onClick={() => selectLocation(location)}
            >
              <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="font-medium text-sm block truncate">{location.city}</span>
                <span className="text-xs text-muted-foreground line-clamp-1">
                  {location.formattedAddress}
                </span>
              </div>
            </button>
          ))}
        </Card>
      )}
    </div>
  );
}

export default LocationSearch;
