import { useQuery } from "@tanstack/react-query";
import { getPartnerAddress } from "../../services/partnerAddress.service";

export const usePartnerAddress = () => {
  return useQuery({
    queryKey: ["partner-address"],
    queryFn: getPartnerAddress,
  });
};
