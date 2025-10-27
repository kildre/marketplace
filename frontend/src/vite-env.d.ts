/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_KEYCLOAK_URL: string
  readonly VITE_KEYCLOAK_REALM: string
  readonly VITE_KEYCLOAK_CLIENT_ID: string
  readonly VITE_KEYCLOAK_CHECK_LOGIN_IFRAME: string
  readonly VITE_BYPASS_AUTH: string
  readonly VITE_ENVIRONMENT_NAME: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
