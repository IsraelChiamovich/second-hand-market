import { useState, useEffect, useCallback } from "react";
import { MapPin, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface LocationData {
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

// Predefined Israeli cities with coordinates
const ISRAELI_CITIES = [
  { name: "תל אביב", lat: 32.0853, lng: 34.7818 },
  { name: "ירושלים", lat: 31.7683, lng: 35.2137 },
  { name: "חיפה", lat: 32.7940, lng: 34.9896 },
  { name: "באר שבע", lat: 31.2530, lng: 34.7915 },
  { name: "נתניה", lat: 32.3286, lng: 34.8569 },
  { name: "ראשון לציון", lat: 31.9730, lng: 34.7925 },
  { name: "פתח תקווה", lat: 32.0841, lng: 34.8878 },
  { name: "אשדוד", lat: 31.8044, lng: 34.6553 },
  { name: "הרצליה", lat: 32.1656, lng: 34.8467 },
  { name: "רמת גן", lat: 32.0680, lng: 34.8248 },
  { name: "בת ים", lat: 32.0231, lng: 34.7505 },
  { name: "אילת", lat: 29.5577, lng: 34.9519 },
  { name: "רחובות", lat: 31.8928, lng: 34.8113 },
  { name: "כפר סבא", lat: 32.1780, lng: 34.9065 },
  { name: "מודיעין", lat: 31.8970, lng: 35.0104 },
];

export function LocationPicker({ value, onChange, className }: LocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState(value?.formattedAddress || "");
  const [suggestions, setSuggestions] = useState<typeof ISRAELI_CITIES>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(value || null);

  useEffect(() => {
    if (value) {
      setSelectedLocation(value);
      setSearchQuery(value.formattedAddress);
    }
  }, [value]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    
    if (query.length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const filtered = ISRAELI_CITIES.filter(city =>
      city.name.includes(query)
    );
    setSuggestions(filtered);
    setShowSuggestions(true);
  }, []);

  const selectCity = (city: typeof ISRAELI_CITIES[0]) => {
    const location: LocationData = {
      formattedAddress: city.name,
      city: city.name,
      lat: city.lat,
      lng: city.lng,
    };
    setSelectedLocation(location);
    setSearchQuery(city.name);
    setShowSuggestions(false);
    onChange(location);
  };

  const clearSelection = () => {
    setSelectedLocation(null);
    setSearchQuery("");
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
            placeholder="חפש עיר..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => searchQuery && setSuggestions.length > 0 && setShowSuggestions(true)}
            className="pr-10 pl-10"
          />
          {selectedLocation && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute left-1 top-1/2 -translate-y-1/2 h-8 w-8"
              onClick={clearSelection}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <Card className="absolute z-50 w-full mt-1 max-h-60 overflow-auto">
            {suggestions.map((city) => (
              <button
                key={city.name}
                type="button"
                className="w-full px-4 py-3 text-right hover:bg-muted transition-colors flex items-center gap-2"
                onClick={() => selectCity(city)}
              >
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{city.name}</span>
              </button>
            ))}
          </Card>
        )}

        {/* Show all cities when no search */}
        {showSuggestions && searchQuery.length === 0 && (
          <Card className="absolute z-50 w-full mt-1 max-h-60 overflow-auto">
            {ISRAELI_CITIES.map((city) => (
              <button
                key={city.name}
                type="button"
                className="w-full px-4 py-3 text-right hover:bg-muted transition-colors flex items-center gap-2"
                onClick={() => selectCity(city)}
              >
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{city.name}</span>
              </button>
            ))}
          </Card>
        )}
      </div>

      {/* Mini map preview */}
      {selectedLocation && selectedLocation.lat !== 0 && (
        <div className="mt-3 rounded-lg overflow-hidden border border-border">
          <div className="relative h-32 bg-muted">
            <iframe
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${selectedLocation.lng - 0.02},${selectedLocation.lat - 0.01},${selectedLocation.lng + 0.02},${selectedLocation.lat + 0.01}&layer=mapnik&marker=${selectedLocation.lat},${selectedLocation.lng}`}
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

      {/* Quick city buttons */}
      <div className="mt-3 flex flex-wrap gap-2">
        {ISRAELI_CITIES.slice(0, 6).map((city) => (
          <Button
            key={city.name}
            type="button"
            variant={selectedLocation?.city === city.name ? "default" : "outline"}
            size="sm"
            onClick={() => selectCity(city)}
          >
            {city.name}
          </Button>
        ))}
      </div>
    </div>
  );
}
