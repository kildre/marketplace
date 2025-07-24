import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Import the Product type
interface CartItem {
  product: {
    id: number;
    name: string;
    type: string;
    price: number | null;
    description: string;
    unit: string;
    rom: string;
  };
  quantity: number;
}

// Types for form data
export interface OrganizationFormData {
  organization: string;
  organizationOther: string;
}

export interface RequestDetailsFormData {
  pocName: string;
  pocPhone: string;
  pocEmail: string;
  useCaseDescription: string;
}

export interface SubmissionData {
  requestId: string;
  personalData: {
    name: string;
    email: string;
    designation: string;
    agency: string;
  };
  requestDetails: OrganizationFormData & RequestDetailsFormData;
  cartItems: CartItem[];
  summary: {
    totalItems: number;
    totalQuantity: number;
    pendingPriceItems: number;
    estimatedROM: string | undefined;
  };
  submittedAt: string;
}

// Query keys
export const formKeys = {
  organization: ["form", "organization"] as const,
  requestDetails: ["form", "requestDetails"] as const,
  all: ["form"] as const,
};

// Hook for organization form state
export const useOrganizationForm = () => {
  const queryClient = useQueryClient();

  const {
    data: organizationData = { organization: "", organizationOther: "" },
  } = useQuery({
    queryKey: formKeys.organization,
    queryFn: () => ({ organization: "", organizationOther: "" }),
    staleTime: Infinity,
  });

  const updateOrganization = useMutation({
    mutationFn: async (data: Partial<OrganizationFormData>) => {
      const currentData = queryClient.getQueryData<OrganizationFormData>(
        formKeys.organization
      ) || { organization: "", organizationOther: "" };
      return { ...currentData, ...data };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(formKeys.organization, data);
    },
  });

  const resetOrganization = useMutation({
    mutationFn: async () => ({ organization: "", organizationOther: "" }),
    onSuccess: (data) => {
      queryClient.setQueryData(formKeys.organization, data);
    },
  });

  return {
    organization: organizationData.organization,
    organizationOther: organizationData.organizationOther,
    updateOrganization: updateOrganization.mutate,
    resetOrganization: resetOrganization.mutate,
    isUpdating: updateOrganization.isPending,
  };
};

// Hook for request details form state
export const useRequestDetailsForm = () => {
  const queryClient = useQueryClient();

  const {
    data: requestDetailsData = {
      pocName: "",
      pocPhone: "",
      pocEmail: "",
      useCaseDescription: "",
    },
  } = useQuery({
    queryKey: formKeys.requestDetails,
    queryFn: () => ({
      pocName: "",
      pocPhone: "",
      pocEmail: "",
      useCaseDescription: "",
    }),
    staleTime: Infinity,
  });

  const updateRequestDetails = useMutation({
    mutationFn: async (data: Partial<RequestDetailsFormData>) => {
      const currentData = queryClient.getQueryData<RequestDetailsFormData>(
        formKeys.requestDetails
      ) || { pocName: "", pocPhone: "", pocEmail: "", useCaseDescription: "" };
      return { ...currentData, ...data };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(formKeys.requestDetails, data);
    },
  });

  const resetRequestDetails = useMutation({
    mutationFn: async () => ({
      pocName: "",
      pocPhone: "",
      pocEmail: "",
      useCaseDescription: "",
    }),
    onSuccess: (data) => {
      queryClient.setQueryData(formKeys.requestDetails, data);
    },
  });

  return {
    pocName: requestDetailsData.pocName,
    pocPhone: requestDetailsData.pocPhone,
    pocEmail: requestDetailsData.pocEmail,
    useCaseDescription: requestDetailsData.useCaseDescription,
    updateRequestDetails: updateRequestDetails.mutate,
    resetRequestDetails: resetRequestDetails.mutate,
    isUpdating: updateRequestDetails.isPending,
  };
};

// Hook for form submission
export const useSubmitRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (submissionData: SubmissionData) => {
      // Simulate API call - replace with actual API endpoint
      // eslint-disable-next-line no-console
      console.log("=== FORM SUBMISSION DATA ===");
      // eslint-disable-next-line no-console
      console.log(JSON.stringify(submissionData, null, 2));
      // eslint-disable-next-line no-console
      console.log("=============================");

      // Here you would make the actual API call
      // const response = await fetch('/api/requests', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(submissionData),
      // });
      // return response.json();

      return submissionData;
    },
    onSuccess: () => {
      // Clear form data after successful submission
      queryClient.setQueryData(formKeys.organization, {
        organization: "",
        organizationOther: "",
      });
      queryClient.setQueryData(formKeys.requestDetails, {
        pocName: "",
        pocPhone: "",
        pocEmail: "",
        useCaseDescription: "",
      });
    },
  });
};

// Hook to get combined form data
export const useFormData = () => {
  const organizationData = useQuery({
    queryKey: formKeys.organization,
    queryFn: () => ({ organization: "", organizationOther: "" }),
    staleTime: Infinity,
  }).data || { organization: "", organizationOther: "" };

  const requestDetailsData = useQuery({
    queryKey: formKeys.requestDetails,
    queryFn: () => ({
      pocName: "",
      pocPhone: "",
      pocEmail: "",
      useCaseDescription: "",
    }),
    staleTime: Infinity,
  }).data || {
    pocName: "",
    pocPhone: "",
    pocEmail: "",
    useCaseDescription: "",
  };

  return {
    ...organizationData,
    ...requestDetailsData,
  };
};
