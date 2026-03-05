const getApiBaseUrl = (): string => {
  const url = process.env.NEXT_PUBLIC_API_URL;

  if (url) {
    return url;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("NEXT_PUBLIC_API_URL environment variable is not set");
  }

  return "http://localhost:3000/api";
};

export const API_BASE_URL = getApiBaseUrl();
