"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface SearchableSelectProps {
  value: string;
  placeholder: string;
  items: { uuid: string; name: string }[];
  onValueChange: (uuid: string) => void;
  disabled?: boolean;
}

export function SearchableSelect({
  value,
  placeholder,
  items,
  onValueChange,
  disabled,
}: SearchableSelectProps) {
  const [search, setSearch] = useState("");
  const filtered = items.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase()),
  );
  const selected = items.find((i) => i.uuid === value);

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder}>
          {selected?.name ?? placeholder}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <div className="px-2 py-1.5 sticky top-0 bg-popover border-b">
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-7 text-sm"
          />
        </div>
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground py-3 text-center">
            No results
          </p>
        ) : (
          filtered.map((item) => (
            <SelectItem key={item.uuid} value={item.uuid}>
              {item.name}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}
