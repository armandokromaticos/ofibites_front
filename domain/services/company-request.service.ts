import { CompanyRequestResponse, CreateCompanyRequest } from "@/domain/types";
import { fetcher } from "@/shared/utils/fetch";

export const companyRequestService = {
  /** Endpoint público: sin token ni `X-Company-Id`. */
  create: (data: CreateCompanyRequest): Promise<CompanyRequestResponse> =>
    fetcher<CompanyRequestResponse>("/company-requests", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
