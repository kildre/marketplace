import { useKeycloak as useRealKeycloak } from '@react-keycloak/web';
import { useMockKeycloak } from '../contexts/MockKeycloakProvider';

/**
 * Hook that automatically returns either real Keycloak or mock Keycloak
 * depending on the VITE_BYPASS_AUTH environment variable
 */
export const useKeycloak = () => {
  const bypassAuth = import.meta.env.VITE_BYPASS_AUTH === 'true';
  
  if (bypassAuth) {
    // Return mock Keycloak in development
    return useMockKeycloak();
  } else {
    // Return real Keycloak in production
    return useRealKeycloak();
  }
};

export default useKeycloak;
