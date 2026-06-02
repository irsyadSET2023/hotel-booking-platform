import { parseResponse, requestApi } from "@/lib/utils";
import { RequestMethod } from "../enums";
import { City, Country, PaginationData, RequestResponse } from "../interfaces";

export async function fetchCities(
  countryUuid: string,
  search: string,
  page: number,
  pageSize: number,
): Promise<RequestResponse<PaginationData<City[]> | null>> {
  const response = await requestApi({
    private: false,
    path: `/reference/cities/${countryUuid}?search=${search}&page=${page}&limit=${pageSize}`,
    method: RequestMethod.POST,
  });
  if (!response.success) {
    return parseResponse({
      success: false,
      message: response.message,
      data: null,
    });
  }

  const data = response.data as PaginationData<City[]>;

  const cities = data.data as City[];

  return parseResponse({
    success: response.success,
    message: response.message,
    data: {
      data: cities,
      meta: {
        total: data.meta.total,
        page: data.meta.page,
        limit: data.meta.limit,
        totalPages: data.meta.totalPages,
      },
    },
  });
}

export async function fetchCountries(
  search: string,
  page: number,
  pageSize: number,
): Promise<RequestResponse<PaginationData<Country[]> | null>> {
  const response = await requestApi({
    private: false,
    path: `/reference/countries?search=${search}&page=${page}&per_page=${pageSize}`,
    method: RequestMethod.POST,
  });
  if (!response.success) {
    return parseResponse({
      success: false,
      message: response.message,
      data: null,
    });
  }

  const data = response.data as PaginationData<Country[]>;

  const countries = data.data as Country[];

  return parseResponse({
    success: response.success,
    message: response.message,
    data: {
      data: countries,
      meta: {
        total: data.meta.total,
        page: data.meta.page,
        limit: data.meta.limit,
        totalPages: data.meta.totalPages,
      },
    },
  });
}
