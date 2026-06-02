"use client";
import React, { useEffect, useCallback, useRef } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import InfiniteScroll from "../ui/infinite-scroll";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { fetchCities, fetchCity } from "@/app/(services)/geolocation-service";
import { City } from "@/app/interfaces";

interface CityPickerProps {
  value?: string; // encrypted_id
  //onValueChange?: (uuid: string, city: City) => void;
  onValueChange?: (uuid: string, city: City | null) => void;
  disabled?: boolean;
  placeholder?: string;
  onBlur?: () => void;
  countryUuid?: string;
  prefetchedCity?: City | null;
}

const CityPicker = React.forwardRef<HTMLButtonElement, CityPickerProps>(
  (
    {
      value,
      onValueChange,
      disabled = false,
      placeholder = "Select city...",
      onBlur,
      countryUuid,
      prefetchedCity,
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState("");
    const [page, setPage] = React.useState(1);
    const [loading, setLoading] = React.useState(false);
    const [hasMore, setHasMore] = React.useState(true);
    const [cities, setCities] = React.useState<City[]>([]);
    const [selectedCity, setSelectedCity] = React.useState<City | null>(null);
    const [initialValueLoaded, setInitialValueLoaded] = React.useState(false);
    const [isFetchingInitial, setIsFetchingInitial] = React.useState(false);

    // Use refs to track stable references
    const onValueChangeRef = useRef(onValueChange);
    const loadingRef = useRef(false);

    // Update ref when callback changes
    useEffect(() => {
      onValueChangeRef.current = onValueChange;
    }, [onValueChange]);

    // Debounced search
    const [debouncedSearch, setDebouncedSearch] = React.useState(search);

    useEffect(() => {
      const timer = setTimeout(() => {
        setDebouncedSearch(search);
      }, 300);

      return () => clearTimeout(timer);
    }, [search]);

    // Reset pagination when search changes
    useEffect(() => {
      setCities([]);
      setPage(1);
      setHasMore(true);
    }, [debouncedSearch]);

    // Reset when state changes
    //comment to try the city auto display when input postcode
    //   useEffect(() => {
    //    setCities([]);
    //    setPage(1);
    //    setHasMore(true);
    //    setSelectedCity(null);
    //    setInitialValueLoaded(false);

    //    if (!prefetchedCity) {
    //     onValueChangeRef.current?.("", null);
    //    }
    //   }, [countryUuid, prefetchedCity]);
    // Reset when state changes
    useEffect(() => {
      if (!countryUuid) return;

      setCities([]);
      setPage(1);
      setHasMore(true);
    }, [countryUuid]);

    // Memoized loadCityById function
    const loadCityById = useCallback(async (uuid: string) => {
      if (!uuid) return;

      setIsFetchingInitial(true);
      try {
        const response = await fetchCity(uuid);
        if (response.success && response.data) {
          const city = response.data as City;
          setSelectedCity(city);
          setInitialValueLoaded(true);

          // Add to cities list if not already there
          setCities((prev) => {
            if (!prev.find((c) => c.uuid === uuid)) {
              return [city, ...prev];
            }
            return prev;
          });
        } else {
          setInitialValueLoaded(true);
        }
      } catch (error) {
        console.error("Failed to load city by ID:", error);
        setInitialValueLoaded(true);
      } finally {
        setIsFetchingInitial(false);
      }
    }, []);

    // Sync form value → selectedCity
    useEffect(() => {
      if (!countryUuid || !value) {
        setSelectedCity(null);
        return;
      }
    }, [countryUuid, value, selectedCity, loadCityById]);

    // Memoized loadCities function
    const loadCities = useCallback(
      async (pageNum: number, searchTerm: string) => {
        if (loadingRef.current || !countryUuid) return;

        loadingRef.current = true;
        setLoading(true);

        try {
          const response = await fetchCities(
            countryUuid,
            searchTerm,
            pageNum,
            20,
          );

          if (response.success && response.data) {
            const newCities = response.data.data as City[];

            if (pageNum === 1) {
              setCities(newCities);
            } else {
              setCities((prev) => [...prev, ...newCities]);
            }

            // Check if there are more pages
            const totalPages = Math.ceil(
              response.data.total / response.data.pageSize,
            );
            setHasMore(pageNum < totalPages);
            setPage(pageNum);
          }
        } catch (error) {
          console.error("Failed to load cities:", error);
        } finally {
          setLoading(false);
          loadingRef.current = false;
        }
      },
      [countryUuid],
    );

    // Load initial city by ID when value is provided
    useEffect(() => {
      if (prefetchedCity && prefetchedCity.uuid === value) {
        setSelectedCity(prefetchedCity);
        setIsFetchingInitial(false);
        return;
      }
      if (value && !initialValueLoaded && !selectedCity && !prefetchedCity) {
        loadCityById(value);
      }
    }, [value, initialValueLoaded, selectedCity, loadCityById, prefetchedCity]);

    // Reapply prefetched city once cities list is loaded
    useEffect(() => {
      if (
        prefetchedCity &&
        !selectedCity &&
        cities.length > 0 &&
        prefetchedCity.uuid === value
      ) {
        setSelectedCity(prefetchedCity);
      }
    }, [cities, prefetchedCity, selectedCity, value]);

    // Load initial data when popover opens
    useEffect(() => {
      if (open && cities.length === 0 && countryUuid) {
        loadCities(1, debouncedSearch);
      }
    }, [open, cities.length, countryUuid, debouncedSearch, loadCities]);

    // Load cities when search changes (only if popover is open)
    useEffect(() => {
      if (open && debouncedSearch !== undefined && countryUuid) {
        loadCities(1, debouncedSearch);
      }
    }, [debouncedSearch, countryUuid, open, loadCities]);

    const next = useCallback(() => {
      if (!loadingRef.current && hasMore) {
        loadCities(page + 1, debouncedSearch);
      }
    }, [page, debouncedSearch, hasMore, loadCities]);

    const handleSelect = (city: City) => {
      setSelectedCity(city);

      if (onValueChangeRef.current) {
        onValueChangeRef.current(city.uuid, city);
      }

      onBlur?.();

      setOpen(false);
    };

    // Update selected city when value changes externally
    useEffect(() => {
      if (value && cities.length > 0) {
        const city = cities.find((c) => c.uuid === value);
        if (city && city.uuid !== selectedCity?.uuid) {
          setSelectedCity(city);
        }
      } else if (!value && selectedCity) {
        // Clear selection if value is cleared
        setSelectedCity(null);
      }
    }, [value, cities, selectedCity]);

    const isDisabled = disabled || !countryUuid || isFetchingInitial;

    return (
      <Popover modal={true} open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={isDisabled}
            className="w-full justify-between !rounded-md h-9 border-input shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] bg-transparent font-normal disabled:bg-gray-100 disabled:border-gray-300 disabled:opacity-100 disabled:cursor-not-allowed"
          >
            <span className="truncate">
              {isFetchingInitial ? (
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading City...
                </span>
              ) : selectedCity ? (
                <span
                  className={cn(
                    "flex items-center gap-2 truncate",
                    isDisabled ? "text-muted-foreground/80" : "text-foreground",
                  )}
                >
                  {selectedCity.name}
                </span>
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </span>
            {!isFetchingInitial && (
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search city..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>
                {loading ? "Loading..." : "No city found."}
              </CommandEmpty>
              <CommandGroup>
                {cities.map((city) => (
                  <CommandItem
                    key={city.uuid}
                    value={city.uuid}
                    onSelect={() => handleSelect(city)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedCity?.uuid === city.uuid
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                    {city.name}
                  </CommandItem>
                ))}
                {hasMore && (
                  <InfiniteScroll
                    hasMore={hasMore}
                    isLoading={loading}
                    next={next}
                    threshold={0.8}
                  >
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  </InfiniteScroll>
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  },
);

CityPicker.displayName = "CityPicker";

export default CityPicker;
