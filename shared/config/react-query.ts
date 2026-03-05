import {
  MutationCache,
  QueryCache,
  QueryClient,
} from "@tanstack/react-query";

export function createQueryClient(): QueryClient {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error: Error) => {
        console.error("[QueryCache]", error.message);
      },
    }),
    mutationCache: new MutationCache({
      onError: (error: Error) => {
        console.error("[MutationCache]", error.message);
      },
    }),
    defaultOptions: {
      queries: {
        retry: 1,
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}
