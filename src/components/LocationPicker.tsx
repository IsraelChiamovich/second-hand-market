import { useState, useEffect, useCallback } from "react";
import { MapPin, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

export interface LocationData {
  formattedAddress: string;
  city: string;
  lat: number;
  lng: number;
}

interface LocationPickerProps {
  value?: LocationData;
  onChange: (location: LocationData) => void;
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
    road?: string;
  };
};

const POPULAR_CITIES: Array<Omit<LocationData, "formattedAddress"> & { name: string }> = [
  { name: "תל אביב", city: "תל אביב", lat: 32.0853, lng: 34.7818 },
  { name: "ירושלים", city: "ירושלים", lat: 31.7683, lng: 35.2137 },
  { name: "חיפה", city: "חיפה", lat: 32.794, lng: 34.9896 },
  { name: "באר שבע", city: "באר שבע", lat: 31.253, lng: 34.7915 },
  { name: "נתניה", city: "נתניה", lat: 32.3286, lng: 34.8569 },
  { name: "ראשון לציון", city: "ראשון לציון", lat: 31.973, lng: 34.7925 },
];

const NOMINATIM_ENDPOINT = "https://nominatim.openstreetmap.org/search";

export function LocationPicker({ value, onChange, className }: LocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState(value?.formattedAddress || "");
  const [suggestions, setSuggestions] = useState<LocationData[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(value || null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (value) {
      setSelectedLocation(value);
      setSearchQuery(value.formattedAddress);
    }
  }, [value]);

  const mapResultToLocation = useCallback((result: NominatimResult): LocationData => {
    const city =
      result.address?.city ||
      result.address?.town ||
      result.address?.village ||
      result.address?.municipality ||
      result.address?.state ||
      result.address?.county ||
      result.display_name;

    return {
      formattedAddress: result.display_name,
      city,
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
    };
  }, []);

  const fetchSuggestions = useCallback(
    async (query: string, controller: AbortController) => {
      setIsSearching(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          q: query,
          format: "jsonv2",
          addressdetails: "1",
          limit: "6",
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
          setError("לא הצלחנו להביא תוצאות כרגע. נסה שוב.");
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
      setError(null);
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

  const selectLocation = (location: LocationData) => {
    setSelectedLocation(location);
    setSearchQuery(location.formattedAddress);
    setShowSuggestions(false);
    onChange(location);
  };

  const selectCity = (city: (typeof POPULAR_CITIES)[number]) => {
    selectLocation({
      formattedAddress: city.name,
      city: city.city,
      lat: city.lat,
      lng: city.lng,
    });
  };

  const clearSelection = () => {
    setSelectedLocation(null);
    setSearchQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    setError(null);
    onChange({ formattedAddress: "", city: "", lat: 0, lng: 0 });
  };

  return (
    <div className={className}>
      <Label className="mb-2 block">מיקום</Label>

      <div className="relative">
        <div className="relative">
          <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="חפש כתובת או עיר..."
            value={searchQuery}
            autoComplete="off"
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            className="pr-10 pl-10"
          />
          {selectedLocation && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute left-1 top-1/2 -translate-y-1/2 h-8 w-8"
              onClick={clearSelection}
              aria-label="נקה בחירה"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {showSuggestions && (
          <Card className="absolute z-50 w-full mt-1 max-h-64 overflow-auto">
            {isSearching && (
              <div className="px-4 py-3 flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                מחפש תוצאות...
              </div>
            )}

            {!isSearching && suggestions.length === 0 && searchQuery.trim().length >= 2 && !error && (
              <div className="px-4 py-3 text-muted-foreground text-sm">לא נמצאו תוצאות מתאימות</div>
            )}

            {!isSearching &&
              suggestions.map((location) => (
                <button
                  key={`${location.formattedAddress}-${location.lat}-${location.lng}`}
                  type="button"
                  className="w-full px-4 py-3 text-right hover:bg-muted transition-colors flex flex-col items-start gap-1"
                  onClick={() => selectLocation(location)}
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">{location.city}</span>
                  </div>
                  <span className="text-xs text-muted-foreground line-clamp-2 text-left w-full">
                    {location.formattedAddress}
                  </span>
                </button>
              ))}

            {error && <div className="px-4 py-3 text-destructive text-sm">{error}</div>}
          </Card>
        )}
      </div>

      {selectedLocation && selectedLocation.lat !== 0 && (
        <div className="mt-3 rounded-lg overflow-hidden border border-border">
          <div className="relative h-32 bg-muted">
            <iframe
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                selectedLocation.lng - 0.02
              },${selectedLocation.lat - 0.01},${selectedLocation.lng + 0.02},${
                selectedLocation.lat + 0.01
              }&layer=mapnik&marker=${selectedLocation.lat},${selectedLocation.lng}`}
              className="w-full h-full border-0"
              title="מפת מיקום"
            />
          </div>
          <div className="p-2 bg-muted/50 text-sm text-center">
            <MapPin className="inline h-3 w-3 ml-1" />
            {selectedLocation.formattedAddress}
          </div>
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {POPULAR_CITIES.map((city) => (
          <Button
            key={city.name}
            type="button"
            variant={selectedLocation?.city === city.city ? "default" : "outline"}
            size="sm"
            onClick={() => selectCity(city)}
          >
            {city.name}
          </Button>
        ))}
      </div>

      <p className="mt-2 text-xs text-muted-foreground text-right">
        החיפוש מתבצע באמצעות OpenStreetMap (Nominatim).
      </p>
    </div>
  );
}
