import { useCallback } from "react";

// Simple event system for triggering requests refresh
const refreshCallbacks = new Set<() => void>();

export const useRequestsRefresh = () => {
  const subscribe = useCallback((callback: () => void) => {
    refreshCallbacks.add(callback);
    return () => {
      refreshCallbacks.delete(callback);
    };
  }, []);

  const triggerRefresh = useCallback(() => {
    refreshCallbacks.forEach((callback) => callback());
  }, []);

  return { subscribe, triggerRefresh };
};
