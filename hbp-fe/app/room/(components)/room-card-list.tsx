"use client";

import {
  PaginationPages,
  PaginationToolbar,
} from "@/components/reusable/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Room } from "@/app/interfaces";
import { RoomCard } from "./room-card";
import { SearchInput } from "@/components/reusable/search-input";

const ROOM_CATEGORIES = ["Standard", "Deluxe", "Suite"] as const;

/* -------------------- utils -------------------- */

const safeDateToISO = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
};

const isValidRange = (start?: string, end?: string) => {
  if (!start || !end) return true;
  return new Date(start) <= new Date(end);
};

/* -------------------- types -------------------- */

interface RoomCardListProps {
  rooms: Room[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  searchTerm: string;
  roomCategory: string;
  checkInDate: string;
  checkOutDate: string;
}

/* -------------------- component -------------------- */

export function RoomCardList({
  rooms,
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  searchTerm,
  roomCategory,
  checkInDate,
  checkOutDate,
}: RoomCardListProps) {
  const router = useRouter();

  const baseParams = () => {
    const params = new URLSearchParams();

    params.set("page", "1");
    params.set("pageSize", String(pageSize));

    if (searchTerm) params.set("search", searchTerm);
    if (roomCategory) params.set("roomCategory", roomCategory);
    if (checkInDate) params.set("checkInDate", checkInDate);
    if (checkOutDate) params.set("checkOutDate", checkOutDate);

    return params;
  };

  const updateQuery = (key: string, value: string) => {
    const params = baseParams();

    if (value) params.set(key, value);
    else params.delete(key);

    router.push(`?${params.toString()}`);
  };

  /* -------------------- handlers -------------------- */

  const handleCheckInChange = (value: string) => {
    const iso = safeDateToISO(value);
    if (!iso) return;

    // reset invalid range
    if (checkOutDate && !isValidRange(iso, checkOutDate)) {
      updateQuery("checkOutDate", "");
    }

    updateQuery("checkInDate", iso);
  };

  const handleCheckOutChange = (value: string) => {
    const iso = safeDateToISO(value);
    if (!iso) return;

    if (!isValidRange(checkInDate, iso)) return;

    updateQuery("checkOutDate", iso);
  };

  const handleCategoryChange = (value: string) => {
    updateQuery("roomCategory", value === "all" ? "" : value);
  };

  const handlePageSizeChange = (value: string) => {
    updateQuery("pageSize", value);
  };

  /* -------------------- UI -------------------- */

  return (
    <div className="w-full max-w mx-auto p-1 space-y-7">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Rooms</h1>
        <p className="text-sm text-muted-foreground">
          Manage and view all your rooms here.
        </p>
      </div>

      <div className="bg-card rounded-xl shadow-sm border p-8 space-y-6">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Check-in */}
          <div>
            <label className="text-sm text-muted-foreground">Check-in</label>
            <Input
              type="date"
              value={checkInDate?.split("T")[0] || ""}
              onChange={(e) => handleCheckInChange(e.target.value)}
            />
          </div>

          {/* Check-out */}
          <div>
            <label className="text-sm text-muted-foreground">Check-out</label>
            <Input
              type="date"
              value={checkOutDate?.split("T")[0] || ""}
              onChange={(e) => handleCheckOutChange(e.target.value)}
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-sm text-muted-foreground">Category</label>
            <Select
              value={roomCategory || "all"}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {ROOM_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search */}
          <div>
            <label className="text-sm text-muted-foreground">Search</label>
            <SearchInput placeholder="Search rooms..." />
          </div>
        </div>

        {/* Toolbar */}
        <PaginationToolbar
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={totalCount}
          onPageSizeChange={handlePageSizeChange}
        />

        {/* Content */}
        {rooms.length > 0 ? (
          <>
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {rooms.map((room) => (
                <RoomCard
                  key={room.uuid}
                  name={room.name}
                  hotelName={room.hotel.name}
                  basePrice={room.basePrice}
                  maxOccupancy={room.maxOccupancy}
                />
              ))}
            </div>

            <div className="flex justify-end">
              <PaginationPages
                currentPage={currentPage}
                totalPages={totalPages}
              />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Building2 className="w-10 h-10 text-muted-foreground" />

            <div className="text-center space-y-1">
              <h3 className="text-lg font-semibold">No rooms found</h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting filters or search terms.
              </p>
            </div>

            <Link href="/rooms">
              <Button>Reset Filters</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
