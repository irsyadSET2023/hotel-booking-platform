import { serverConfig } from "@/app/config/server";
import { RequestResponse, RequestData } from "@/app/interfaces";
import { clsx, type ClassValue } from "clsx";
import { redirect } from "next/dist/client/components/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseResponse<T>({
  data,
  success = true,
  message = "Fetched",
}: {
  data: T;
  success?: boolean;
  message?: string;
}): RequestResponse<T> {
  return {
    data,
    success,
    message,
  };
}

export async function requestApi(requestData: RequestData) {
  try {
    const response = await fetch(`${serverConfig.apiUrl}${requestData.path}`, {
      method: requestData.method,
      ...(requestData.data
        ? {
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestData.data),
          }
        : {}),
    });

    const responseData = await response.json();

    //uncomment this to see the response data
    //console.log("responseData", responseData.data);

    if (responseData.success) {
      return parseResponse({
        success: true,
        message: responseData.message,
        data: responseData.data,
      });
    } else if (response.status === 401 || response.status === 403) {
      const skipPaths = ["/secure/login", "/secure/info"]; // Add any other paths that should not trigger a redirect on auth failure
      if (skipPaths.includes(requestData.path)) {
        return parseResponse({
          data: null,
          success: false,
          message: "Unauthorized",
        });
      } else {
        redirect("/invalid-session");
      }
    } else {
      console.error("===== API ERROR START =====");
      console.error("Path:", requestData.path);
      console.error("Method:", requestData.method);
      console.error("Timestamp:", new Date().toISOString());

      console.error("--- Request Data ---");
      console.error(JSON.stringify(requestData, null, 2));

      console.error("--- Response Data ---");
      console.error(JSON.stringify(responseData, null, 2));

      console.error("===== API ERROR END =====");
      return parseResponse({
        success: false,
        message: responseData.message,
        data: responseData.data,
      });
    }
  } catch (error) {
    if (isRedirectError(error)) {
      throw error; // Let Next.js handle the redirect
    }
    console.error("===== API REQUEST FAILED =====");
    console.error("Path:", requestData.path);
    console.error("Method:", requestData.method);
    console.error("Timestamp:", new Date().toISOString());

    console.error("--- Request Data ---");
    console.error(JSON.stringify(requestData, null, 2));

    console.error("--- Error ---");
    console.error(error instanceof Error ? error.stack : error);

    console.error("===== API REQUEST FAILED END =====");

    return parseResponse({
      success: false,
      message: "Network error or server is unreachable",
      data: null,
    });
  }
}
