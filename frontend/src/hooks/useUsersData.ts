// @src/hooks/useUsersData.ts

import { useState, useEffect } from 'react';
import { 
  UserData, 
  getAllUsers, 
  getUserById, 
  getUsersByOrganization,
  searchUsers,
  UsersResponse 
} from '../data/mock-usersData';

interface UseUsersDataResult {
  users: UserData[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseUserDataResult {
  user: UserData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseUserSearchResult {
  users: UserData[];
  loading: boolean;
  error: string | null;
  search: (query: string) => Promise<void>;
}

// Hook to get all users or users for a specific organization
export const useUsersData = (organization?: string): UseUsersDataResult => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let usersData: UserData[];
      if (organization) {
        usersData = await getUsersByOrganization(organization);
      } else {
        const response: UsersResponse = await getAllUsers();
        usersData = response.users;
      }
      
      setUsers(usersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [organization]);

  const refetch = async () => {
    await fetchUsers();
  };

  return {
    users,
    loading,
    error,
    refetch,
  };
};

// Hook to get a single user by ID
export const useUserData = (userId: string): UseUserDataResult => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userData = await getUserById(userId);
      setUser(userData);
      
      if (!userData) {
        setError('User not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUser();
    }
  }, [userId]);

  const refetch = async () => {
    await fetchUser();
  };

  return {
    user,
    loading,
    error,
    refetch,
  };
};

// Hook for searching users
export const useUserSearch = (): UseUserSearchResult => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const usersData = await searchUsers(query);
      setUsers(usersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search users');
    } finally {
      setLoading(false);
    }
  };

  return {
    users,
    loading,
    error,
    search,
  };
};
