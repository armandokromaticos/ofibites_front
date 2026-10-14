import { useMutation } from "@tanstack/react-query";

import { companyRequestService } from "@/domain/services";
import { CreateCompanyRequest } from "@/domain/types";

export function useCreateCompanyRequest() {
  return useMutation({
    mutationFn: (data: CreateCompanyRequest) => companyRequestService.create(data),
  });
}
