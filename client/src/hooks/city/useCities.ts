import { useQuery } from "@tanstack/react-query"
import { getCities } from "../../services/city.service"

export const useCities = (provinceId?: number) => {
  return useQuery({
    queryKey: ["cities", provinceId],
    queryFn: () => getCities(provinceId),
    enabled: !!provinceId,
  });
};