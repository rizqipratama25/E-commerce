import { useQuery } from "@tanstack/react-query"
import { getDistricts } from "../../services/district.service"

export const useDistricts = (cityId?: number) => {
  return useQuery({
    queryKey: ["districts", cityId],
    queryFn: () => getDistricts(cityId),
    enabled: cityId === undefined || !!cityId,
  });
};