import { useQuery } from "@tanstack/react-query"
import { getMegaMenuCategories, type Category } from "../../services/category.service"

export const useMegaMenuCategories = () => {
    return useQuery<Category[]>({
        queryKey: ["mega-menu-categories"],
        queryFn: getMegaMenuCategories,
        staleTime: 5 * 60 * 1000,
    });
};