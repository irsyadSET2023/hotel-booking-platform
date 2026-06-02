"use server";

import { parseResponse, requestApi } from "@/lib/utils";
import { RequestMethod } from "../enums";
import type { City, Country } from "../interfaces";

export async function getCountries(
  search = "",
  page = 1,
  pageSize = 50,
): Promise<Country[]> {
  const response = await requestApi({
    path: `/references/countries?search=${search}&page=${page}&per_page=${pageSize}`,
    method: RequestMethod.GET,
  });

  if (!response.success) return [];

  const data = response.data as { data: Country[] };
  return Array.isArray(data?.data) ? data.data : [];
}

export async function getCities(
  countryUuid: string,
  search = "",
  page = 1,
  pageSize = 100,
): Promise<City[]> {
  const response = await requestApi({
    path: `/references/cities/${countryUuid}?search=${search}&page=${page}&limit=${pageSize}`,
    method: RequestMethod.GET,
  });

  if (!response.success) return [];

  const data = response.data as { data: City[] };
  return Array.isArray(data?.data) ? data.data : [];
}
