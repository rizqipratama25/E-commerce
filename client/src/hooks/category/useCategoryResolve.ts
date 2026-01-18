import { useQuery } from "@tanstack/react-query";
import { resolveCategory } from "../../services/category.service";

export const useCategoryResolve = (path: string) => {
  return useQuery({
    queryKey: ["category-resolve", path],
    queryFn: () => resolveCategory(path),
    enabled: !!path,
    staleTime: 5 * 60 * 1000,
  });
};
