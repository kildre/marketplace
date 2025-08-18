import Keycloak, { KeycloakConfig } from "keycloak-js";

// Debug environment variables in development
if (import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.log('Keycloak Environment Variables:', {
    url: import.meta.env.VITE_KEYCLOAK_URL,
    realm: import.meta.env.VITE_KEYCLOAK_REALM,
    clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
    bypassAuth: import.meta.env.VITE_BYPASS_AUTH
  });
}

const keycloakConfig: KeycloakConfig = {
  url: import.meta.env.VITE_KEYCLOAK_URL, // e.g., https://keycloak.example.com/auth
  realm: import.meta.env.VITE_KEYCLOAK_REALM, // e.g., myrealm
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID, // e.g., react-app
};

// Validate required configuration
if (!keycloakConfig.url) {
  throw new Error(`Keycloak configuration missing 'url'. Check VITE_KEYCLOAK_URL environment variable. Current value: ${import.meta.env.VITE_KEYCLOAK_URL}`);
}

if (!keycloakConfig.realm) {
  throw new Error(`Keycloak configuration missing 'realm'. Check VITE_KEYCLOAK_REALM environment variable. Current value: ${import.meta.env.VITE_KEYCLOAK_REALM}`);
}

if (!keycloakConfig.clientId) {
  throw new Error(`Keycloak configuration missing 'clientId'. Check VITE_KEYCLOAK_CLIENT_ID environment variable. Current value: ${import.meta.env.VITE_KEYCLOAK_CLIENT_ID}`);
}

const keycloak = new Keycloak(keycloakConfig);

export default keycloak;
