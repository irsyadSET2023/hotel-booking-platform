"use server";

import { parseResponse, requestApi } from "@/lib/utils";
import { RequestMethod } from "../enums";
import {
  PaginationData,
  RequestData,
  RequestResponse,
  Room,
} from "../interfaces";

export async function getRoomList(
  page: number = 1,
  pageSize: number = 10,
  checkInDate: string,
  checkOutDate: string,
  search?: string,
  roomCategory?: string,
): Promise<RequestResponse<PaginationData<Room[]>>> {
  const requestData: RequestData = {
    path: `/rooms/categories?checkInDate=${checkInDate}&checkOutDate=${checkOutDate}&page=${page}&limit=${pageSize}&search=${search ?? ""}&roomCategory=${roomCategory ?? ""}`,
    method: RequestMethod.GET,
  };

  const response = await requestApi(requestData);
  console.log("API Response for getRoomList:", response);
  if (!response.success) {
    return parseResponse({
      success: false,
      message: response.message,
      data: {
        data: [],
        meta: {
          total: 0,
          page,
          limit: pageSize,
          totalPages: 0,
        },
      },
    });
  }

  // Map API response to our expected format
  const data = response?.data as PaginationData<Room[]>;
  const paginationMeta: PaginationData<Room[]>["meta"] = response.data.meta;

  return parseResponse({
    success: true,
    message: "Room list fetched successfully",
    data: {
      data: data.data as Room[],
      meta: {
        total: paginationMeta.total,
        page: paginationMeta.page,
        limit: paginationMeta.limit,
        totalPages: paginationMeta.totalPages,
      },
    },
  });
}
