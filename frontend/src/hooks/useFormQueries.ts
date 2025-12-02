import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiService } from "../services/apiService";
import { useRequestsRefresh } from "./useRequestsRefresh";
import {
  OrganizationFormData,
  RequestDetailsFormData,
  SubmissionData,
} from "../interfaces";

// Query keys
export const formKeys = {
  organization: ["form", "organization"] as const,
  requestDetails: ["form", "requestDetails"] as const,
  submissionAttempts: ["form", "submissionAttempts"] as const,
  validationErrors: ["form", "validationErrors"] as const,
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
  const { triggerRefresh } = useRequestsRefresh();

  return useMutation({
    mutationFn: async (submissionData: SubmissionData) => {
      // Validate cart items before submission
      if (!submissionData.cartItems || submissionData.cartItems.length === 0) {
        throw new Error("Cannot submit request: Cart is empty");
      }

      // Validate each cart item
      const invalidItems = submissionData.cartItems.filter(
        (item) => !item.product.name || !item.product.name.trim()
      );
      if (invalidItems.length > 0) {
        throw new Error(
          "Cannot submit request: Some cart items have invalid names"
        );
      }

      // Transform frontend data to backend format
      const apiRequest = {
        requestNumber: submissionData.requestId,
        requestorEmail: submissionData.personalData.email,
        designation: submissionData.personalData.designation,
        agency: submissionData.personalData.agency,
        organization: submissionData.requestDetails.organization,
        otherOrganization:
          submissionData.requestDetails.organizationOther || "",
        pointOfContact: submissionData.requestDetails.pocName,
        email: submissionData.requestDetails.pocEmail,
        phoneNumber: submissionData.requestDetails.pocPhone,
        estimatedRom: submissionData.summary.estimatedROM || "",
        requestedToolName: "", // This might need to be computed from cart items
        description: submissionData.requestDetails.useCaseDescription,
        cartItems: submissionData.cartItems.map((item) => ({
          name: item.product.name?.trim() || "",
          quantity: Math.floor(Number(item.quantity)) || 1,
        })),
      };

      // Log the request payload for debugging (only in development)
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log("[useFormQueries] Submitting request:", apiRequest);
      }

      // Submit to backend API
      return await ApiService.submitRequest(apiRequest);
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

      // Trigger global refresh to update sidebar counter
      triggerRefresh();
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

// Hook for tracking submission attempts
export const useSubmissionAttempts = () => {
  const queryClient = useQueryClient();

  const { data: submissionData = { hasAttempted: false } } = useQuery({
    queryKey: formKeys.submissionAttempts,
    queryFn: () => ({ hasAttempted: false }),
    staleTime: Infinity,
  });

  const markSubmissionAttempt = useMutation({
    mutationFn: async () => ({ hasAttempted: true }),
    onSuccess: (data) => {
      queryClient.setQueryData(formKeys.submissionAttempts, data);
    },
  });

  const resetSubmissionAttempts = useMutation({
    mutationFn: async () => ({ hasAttempted: false }),
    onSuccess: (data) => {
      queryClient.setQueryData(formKeys.submissionAttempts, data);
    },
  });

  return {
    hasAttemptedSubmission: submissionData.hasAttempted,
    markSubmissionAttempt: markSubmissionAttempt.mutate,
    resetSubmissionAttempts: resetSubmissionAttempts.mutate,
  };
};

// Hook for tracking validation errors
export const useValidationErrors = () => {
  const queryClient = useQueryClient();

  const { data: validationData = { phoneError: "", emailError: "" } } =
    useQuery({
      queryKey: formKeys.validationErrors,
      queryFn: () => ({ phoneError: "", emailError: "" }),
      staleTime: Infinity,
    });

  const updateValidationErrors = useMutation({
    mutationFn: async (data: { phoneError?: string; emailError?: string }) => {
      const currentData = queryClient.getQueryData<{
        phoneError: string;
        emailError: string;
      }>(formKeys.validationErrors) || { phoneError: "", emailError: "" };
      return { ...currentData, ...data };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(formKeys.validationErrors, data);
    },
  });

  const resetValidationErrors = useMutation({
    mutationFn: async () => ({ phoneError: "", emailError: "" }),
    onSuccess: (data) => {
      queryClient.setQueryData(formKeys.validationErrors, data);
    },
  });

  const hasValidationErrors =
    validationData.phoneError !== "" || validationData.emailError !== "";

  return {
    phoneError: validationData.phoneError,
    emailError: validationData.emailError,
    hasValidationErrors,
    updateValidationErrors: updateValidationErrors.mutate,
    resetValidationErrors: resetValidationErrors.mutate,
  };
};
