"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

//showing total item and page selector only
interface PaginationToolbarProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageSizeChange: (value: string) => void;
  pageSizeOptions?: number[];
}

export function PaginationToolbar({
  currentPage,
  pageSize,
  totalItems,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 15, 20, 25, 50, 100],
}: PaginationToolbarProps) {
  const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-row items-center justify-between sm:justify-start gap-4 sm:gap-4">
      {/* Left side: Page size selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs sm:text-sm text-muted-foreground">Show:</span>
        <Select value={pageSize.toString()} onValueChange={onPageSizeChange}>
          <SelectTrigger className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((size) => (
              <SelectItem key={size} value={size.toString()}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {/* Right side: Showing info */}
      <div className="text-xs sm:text-sm text-muted-foreground">
        {totalItems > 0 ? (
          <>
            Showing{" "}
            <span className="font-medium text-foreground">
              {start} – {end}
            </span>{" "}
            of <span className="font-medium text-foreground">{totalItems}</span>{" "}
            items
          </>
        ) : (
          "No results"
        )}
      </div>
    </div>
  );
}

//page only
interface PaginationPagesProps {
  currentPage: number;
  totalPages: number;
}

export function PaginationPages({
  currentPage,
  totalPages,
}: PaginationPagesProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams?.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  if (!totalPages) return null;

  const renderPageNumbers = () => {
    const items: React.ReactNode[] = [];
    const showEllipsisStart = currentPage > 3;
    const showEllipsisEnd = currentPage < totalPages - 2;

    items.push(
      <PaginationItem key={1}>
        <PaginationLink
          href="#"
          isActive={currentPage === 1}
          onClick={(e) => {
            e.preventDefault();
            handlePageChange(1);
          }}
        >
          1
        </PaginationLink>
      </PaginationItem>,
    );

    if (showEllipsisStart) {
      items.push(
        <PaginationItem key="ellipsis-start">
          <PaginationEllipsis />
        </PaginationItem>,
      );
    }

    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            href="#"
            isActive={currentPage === i}
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(i);
            }}
          >
            {i}
          </PaginationLink>
        </PaginationItem>,
      );
    }

    if (showEllipsisEnd) {
      items.push(
        <PaginationItem key="ellipsis-end">
          <PaginationEllipsis />
        </PaginationItem>,
      );
    }

    if (totalPages > 1) {
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            href="#"
            isActive={currentPage === totalPages}
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(totalPages);
            }}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>,
      );
    }

    return items;
  };

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (currentPage > 1) handlePageChange(currentPage - 1);
            }}
          />
        </PaginationItem>

        {renderPageNumbers()}

        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (currentPage < totalPages) handlePageChange(currentPage + 1);
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

interface PaginationComponentProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  pageSizeOptions?: number[];
}

export function PaginationComponent({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  pageSizeOptions = [5, 10, 15, 20, 25, 50, 100],
}: PaginationComponentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    const newSearchParams = new URLSearchParams(searchParams?.toString() || "");
    newSearchParams.set("page", page.toString());
    router.push(`?${newSearchParams.toString()}`);
  };

  const handlePageSizeChange = (newPageSize: string) => {
    const newSearchParams = new URLSearchParams(searchParams?.toString() || "");
    newSearchParams.set("pageSize", newPageSize);
    newSearchParams.set("page", "1"); // Reset to first page when changing page size
    router.push(`?${newSearchParams.toString()}`);
  };

  const renderPageNumbers = () => {
    const items: React.ReactNode[] = [];
    const showEllipsisStart = currentPage > 3;
    const showEllipsisEnd = currentPage < totalPages - 2;

    // Always show first page
    items.push(
      <PaginationItem key={1}>
        <PaginationLink
          href="#"
          isActive={currentPage === 1}
          onClick={(e) => {
            e.preventDefault();
            handlePageChange(1);
          }}
        >
          1
        </PaginationLink>
      </PaginationItem>,
    );

    // Show ellipsis after first page
    if (showEllipsisStart) {
      items.push(
        <PaginationItem key="ellipsis-start">
          <PaginationEllipsis />
        </PaginationItem>,
      );
    }

    // Show pages around current page
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      if (i === 1 || i === totalPages) continue;
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            href="#"
            isActive={currentPage === i}
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(i);
            }}
          >
            {i}
          </PaginationLink>
        </PaginationItem>,
      );
    }

    // Show ellipsis before last page
    if (showEllipsisEnd) {
      items.push(
        <PaginationItem key="ellipsis-end">
          <PaginationEllipsis />
        </PaginationItem>,
      );
    }

    // Always show last page
    if (totalPages > 1) {
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            href="#"
            isActive={currentPage === totalPages}
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(totalPages);
            }}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>,
      );
    }

    return items;
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm">
        <span>Show:</span>
        <Select
          value={pageSize.toString()}
          onValueChange={handlePageSizeChange}
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Select page size" />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((size) => (
              <SelectItem key={size} value={size.toString()}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span>
          Showing {(currentPage - 1) * pageSize + 1} -{" "}
          {Math.min(currentPage * pageSize, totalItems)} of {totalItems} items
        </span>
      </div>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage > 1) handlePageChange(currentPage - 1);
              }}
            />
          </PaginationItem>
          {renderPageNumbers()}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage < totalPages) handlePageChange(currentPage + 1);
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
