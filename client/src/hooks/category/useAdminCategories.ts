import { useQuery } from "@tanstack/react-query"
import { getAdminCategories, type Category } from "../../services/category.service"

export const useAdminCategories = () => {
    return useQuery<Category[]>({
        queryKey: ["admin-categories"],
        queryFn: getAdminCategories,
        staleTime: 5 * 60 * 1000,
    });
};