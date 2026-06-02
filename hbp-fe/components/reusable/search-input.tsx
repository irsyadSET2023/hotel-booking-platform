"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { useState, useCallback } from "react";
import { Search, X } from "lucide-react";

interface SearchInputProps {
  placeholder?: string;
  className?: string;
}

export function SearchInput({
  placeholder = "Search...",
  className = "",
}: SearchInputProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Use two states: one for input value, one for actual search
  const [inputValue, setInputValue] = useState(
    searchParams?.get("search") || "",
  );
  const [debouncedTimer, setDebouncedTimer] = useState<NodeJS.Timeout | null>(
    null,
  );

  const handleSearch = useCallback(
    (term: string) => {
      // Clear any existing timer
      if (debouncedTimer) clearTimeout(debouncedTimer);

      // Set new timer
      const timer = setTimeout(() => {
        const newSearchParams = new URLSearchParams(
          searchParams?.toString() || "",
        );
        if (term) {
          newSearchParams.set("search", term);
        } else {
          newSearchParams.delete("search");
        }
        newSearchParams.set("page", "1");
        router.push(`?${newSearchParams.toString()}`);
      }, 300);

      setDebouncedTimer(timer);
    },
    [searchParams, router, debouncedTimer],
  );

  const handleInputChange = (value: string) => {
    setInputValue(value);
    handleSearch(value);
  };

  const resetSearch = () => {
    setInputValue("");
    const newSearchParams = new URLSearchParams(searchParams?.toString() || "");
    newSearchParams.delete("search");
    newSearchParams.set("page", "1");
    router.push(`?${newSearchParams.toString()}`);
  };

  return (
    <div className={`relative ${className}`}>
      <label htmlFor="search">
        <Search
          size={16}
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
        />
      </label>
      <Input
        id="search"
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
        className="px-8 rounded-full text-xs"
      />
      {inputValue && (
        <button
          onClick={resetSearch}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          aria-label="Clear search"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
