import Keycloak, { KeycloakConfig } from "keycloak-js";

// Debug environment variables in development (logging removed)
if (import.meta.env.DEV) {
  // no-op
}

const keycloakConfig: KeycloakConfig = {
  url: import.meta.env.VITE_KEYCLOAK_URL, // e.g., https://keycloak.example.com/auth
  realm: import.meta.env.VITE_KEYCLOAK_REALM, // e.g., myrealm
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID, // e.g., react-app
};

// Helper function to validate required configuration field
function validateConfigField(
  value: string | undefined,
  fieldName: string,
  envVar: string
): void {
  if (!value) {
    throw new Error(
      `Keycloak configuration missing '${fieldName}'. Check ${envVar} environment variable. Current value: ${value}`
    );
  }
}

// Validate required configuration
validateConfigField(keycloakConfig.url, 'url', 'VITE_KEYCLOAK_URL');
validateConfigField(keycloakConfig.realm, 'realm', 'VITE_KEYCLOAK_REALM');
validateConfigField(keycloakConfig.clientId, 'clientId', 'VITE_KEYCLOAK_CLIENT_ID');

const keycloak = new Keycloak(keycloakConfig);

export default keycloak;
