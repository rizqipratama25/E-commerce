import { useQuery } from "@tanstack/react-query";
import { getUrbanVillages } from "../../services/urbanVillage.service";

export const useUrbanVillages = (districtId?: number) => {
  return useQuery({
    queryKey: ["urban-villages", districtId],
    queryFn: () => getUrbanVillages(districtId),
    enabled: districtId === undefined || !!districtId,
  });
};