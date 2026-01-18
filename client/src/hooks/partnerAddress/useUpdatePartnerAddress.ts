import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePartnerAddress, type PartnerAddressPayload } from "../../services/partnerAddress.service";

export const useUpdatePartnerAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PartnerAddressPayload) => updatePartnerAddress(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partner-address"] });
    },
  });
};
