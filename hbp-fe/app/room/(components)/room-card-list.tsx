"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Building2, Loader2 } from "lucide-react";
import Link from "next/link";
import { Room } from "@/app/interfaces";
import { RoomCard } from "./room-card";
import { SearchInput } from "@/components/reusable/search-input";
import { getRoomList } from "@/app/(services)/list-rooms-service";
import { Cart } from "./cart";

const ROOM_CATEGORIES = ["Standard", "Deluxe", "Suite"] as const;

const DEFAULT_CHECK_IN = "2026-06-01T00:00:00.000Z";
const DEFAULT_CHECK_OUT = "2026-06-02T00:00:00.000Z";

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

/* -------------------- component -------------------- */

export function RoomCardList() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page") ?? 1);
  const pageSize = Number(searchParams.get("pageSize") ?? 10);
  const searchTerm = searchParams.get("search") ?? "";
  const roomCategory = searchParams.get("roomCategory") ?? "";
  const checkInDate = searchParams.get("checkInDate") ?? DEFAULT_CHECK_IN;
  const checkOutDate = searchParams.get("checkOutDate") ?? DEFAULT_CHECK_OUT;

  const [rooms, setRooms] = useState<Room[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchRooms = async () => {
      setIsLoading(true);
      const { data, success } = await getRoomList(
        page,
        pageSize,
        checkInDate,
        checkOutDate,
        searchTerm,
        roomCategory,
      );

      if (cancelled) return;

      if (success && data) {
        setRooms(data.data as Room[]);
        setTotalPages(data.meta.totalPages);
        setTotalCount(data.meta.total);
      } else {
        setRooms([]);
        setTotalPages(0);
        setTotalCount(0);
      }
      setIsLoading(false);
    };

    fetchRooms();

    return () => {
      cancelled = true;
    };
  }, [page, pageSize, checkInDate, checkOutDate, searchTerm, roomCategory]);

  /* -------------------- URL helpers -------------------- */

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

  const updateQuery = (updates: Record<string, string>) => {
    const params = baseParams();
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    router.push(`?${params.toString()}`);
  };

  /* -------------------- handlers -------------------- */

  const handleCheckInChange = (value: string) => {
    const iso = safeDateToISO(value);
    if (!iso) return;
    const updates: Record<string, string> = { checkInDate: iso };
    if (checkOutDate && !isValidRange(iso, checkOutDate)) {
      updates.checkOutDate = "";
    }
    updateQuery(updates);
  };

  const handleCheckOutChange = (value: string) => {
    const iso = safeDateToISO(value);
    if (!iso || !isValidRange(checkInDate, iso)) return;
    updateQuery({ checkOutDate: iso });
  };

  const handleCategoryChange = (value: string) =>
    updateQuery({ roomCategory: value === "all" ? "" : value });

  const handlePageSizeChange = (value: string) =>
    updateQuery({ pageSize: value });

  /* -------------------- UI -------------------- */

  return (
    <div className="w-full max-w mx-auto p-1 space-y-7">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Rooms</h1>
          <p className="text-sm text-muted-foreground">
            Manage and view all your rooms here.
          </p>
        </div>
        <Cart />
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
          currentPage={page}
          pageSize={pageSize}
          totalItems={totalCount}
          onPageSizeChange={handlePageSizeChange}
        />

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : rooms.length > 0 ? (
          <>
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {rooms.map((room) => (
                <RoomCard
                  key={room.uuid}
                  uuid={room.uuid}
                  name={room.name}
                  hotelName={room.hotel.name}
                  basePrice={room.basePrice}
                  maxOccupancy={room.maxOccupancy}
                  checkInDate={checkInDate}
                  checkOutDate={checkOutDate}
                />
              ))}
            </div>

            <div className="flex justify-end">
              <PaginationPages currentPage={page} totalPages={totalPages} />
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
