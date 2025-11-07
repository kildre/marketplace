import { createTheme, ThemeProvider } from "@mui/material/styles";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, RenderOptions } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";
import { ReduxCartProvider } from "./contexts/ReduxCartContext";
import { persistor, store } from "./store/store";

// Create a test theme for Material-UI components
const testTheme = createTheme({
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
  },
});

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  initialFormData?: {
    organization?: {
      organization?: string;
      organizationOther?: string;
    };
    requestDetails?: {
      pocName?: string;
      pocPhone?: string;
      pocEmail?: string;
      useCaseDescription?: string;
    };
  };
}

export function renderWithProviders(
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) {
  const { initialFormData, ...renderOptions } = options;

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  // Set initial form data if provided
  if (initialFormData?.organization) {
    queryClient.setQueryData(["form", "organization"], {
      organization: initialFormData.organization.organization || "",
      organizationOther: initialFormData.organization.organizationOther || "",
    });
  }

  if (initialFormData?.requestDetails) {
    queryClient.setQueryData(["form", "requestDetails"], {
      pocName: initialFormData.requestDetails.pocName || "",
      pocPhone: initialFormData.requestDetails.pocPhone || "",
      pocEmail: initialFormData.requestDetails.pocEmail || "",
      useCaseDescription:
        initialFormData.requestDetails.useCaseDescription || "",
    });
  }

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <Provider store={store}>
        <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
          <QueryClientProvider client={queryClient}>
            <BrowserRouter>
              <ThemeProvider theme={testTheme}>
                <ReduxCartProvider>{children}</ReduxCartProvider>
              </ThemeProvider>
            </BrowserRouter>
          </QueryClientProvider>
        </PersistGate>
      </Provider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

export * from "@testing-library/react";
export { renderWithProviders as render };

