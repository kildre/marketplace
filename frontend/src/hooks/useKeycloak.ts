import { useKeycloak as useRealKeycloak } from '@react-keycloak/web';
import { useEnhancedMockKeycloak } from '../contexts/EnhancedMockKeycloakProvider';

/**
 * Hook that automatically returns either real Keycloak or enhanced mock Keycloak
 * depending on the VITE_BYPASS_AUTH environment variable
 */
export const useKeycloak = () => {
  const bypassAuth = import.meta.env.VITE_BYPASS_AUTH === 'true';
  
  if (bypassAuth) {
    // Return enhanced mock Keycloak in development
    return useEnhancedMockKeycloak();
  } else {
    // Return real Keycloak in production
    return useRealKeycloak();
  }
};

export default useKeycloak;
