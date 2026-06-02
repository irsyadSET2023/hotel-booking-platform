import { RequestMethod } from "./enums";

export interface City {
  uuid: string;
  name: string;
}

export interface Country {
  uuid: string;
  name: string;
}

export interface RequestResponse<T> {
  data?: T | PaginationData<T> | null;
  success: boolean;
  message: string;
}

export interface PaginationData<T> {
  data: T;
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface InfiniteScrollData<T> {
  data: T;
  hasMore: boolean;
}

export interface RequestData<T = unknown> {
  path: string;
  method: RequestMethod;
  formData?: FormData;
  data?: T;
  type?: "multipart" | "json";
  private?: boolean;
  isRefreshToken?: boolean;
  activeOrganizationId?: string;
}
