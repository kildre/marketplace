import Keycloak, { KeycloakConfig } from "keycloak-js";

const keycloakConfig: KeycloakConfig = {
  url: import.meta.env.VITE_KEYCLOAK_URL, // e.g., https://keycloak.example.com/auth
  realm: import.meta.env.VITE_KEYCLOAK_REALM, // e.g., myrealm
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID, // e.g., react-app
};

const keycloak = new Keycloak(keycloakConfig);

export default keycloak;
