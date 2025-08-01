// @src/data/mock-usersData.ts

export interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  organization: string;
  clearanceLevel: string;
  isActive: boolean;
  lastLogin: string;
  requestCount: number;
}

export interface UsersResponse {
  users: UserData[];
  totalCount: number;
  lastUpdated: string;
}

// Mock users data simulating API response
const mockUsersData: UserData[] = [
  {
    id: 'kberres',
    firstName: 'K',
    lastName: 'Berres',
    email: 'kberres@metrostar.com',
    role: 'Contractor',
    organization: 'CDAO',
    clearanceLevel: 'Secret',
    isActive: true,
    lastLogin: '01-Aug-25',
    requestCount: 3,
  },
  {
    id: 'joe.snuffy.ctr',
    firstName: 'Joe',
    lastName: 'Snuffy',
    email: 'joe.snuffy.ctr@army.mil',
    role: 'Contractor',
    organization: 'CDAO',
    clearanceLevel: 'Secret',
    isActive: true,
    lastLogin: '24-Jul-25',
    requestCount: 2,
  },
  {
    id: 'john.doe4.mil',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe4.mil@army.mil',
    role: 'Military',
    organization: 'CDAO',
    clearanceLevel: 'Top Secret',
    isActive: true,
    lastLogin: '23-Jul-25',
    requestCount: 2,
  },
  {
    id: 'allen.key.civ',
    firstName: 'Allen',
    lastName: 'Key',
    email: 'allen.key.civ@example.gov',
    role: 'Civilian',
    organization: 'CDAO',
    clearanceLevel: 'Secret',
    isActive: true,
    lastLogin: '22-Jul-25',
    requestCount: 0,
  },
  {
    id: 'jane.smith.mil',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith.mil@army.mil',
    role: 'Military',
    organization: 'CDAO',
    clearanceLevel: 'Top Secret',
    isActive: true,
    lastLogin: '21-Jul-25',
    requestCount: 2,
  },
  {
    id: 'bob.jones.ctr',
    firstName: 'Bob',
    lastName: 'Jones',
    email: 'bob.jones.ctr@example.mil',
    role: 'Contractor',
    organization: 'CDAO',
    clearanceLevel: 'Secret',
    isActive: true,
    lastLogin: '20-Jul-25',
    requestCount: 0,
  },
  // Additional 10 users
  {
    id: 'sarah.wilson.mil',
    firstName: 'Sarah',
    lastName: 'Wilson',
    email: 'sarah.wilson.mil@army.mil',
    role: 'Military',
    organization: 'DTSA',
    clearanceLevel: 'Top Secret',
    isActive: true,
    lastLogin: '25-Jul-25',
    requestCount: 3,
  },
  {
    id: 'mike.johnson.ctr',
    firstName: 'Mike',
    lastName: 'Johnson',
    email: 'mike.johnson.ctr@navy.mil',
    role: 'Contractor',
    organization: 'DMPO',
    clearanceLevel: 'Secret',
    isActive: true,
    lastLogin: '24-Jul-25',
    requestCount: 2,
  },
  {
    id: 'lisa.brown.civ',
    firstName: 'Lisa',
    lastName: 'Brown',
    email: 'lisa.brown.civ@dod.gov',
    role: 'Civilian',
    organization: 'Space Force',
    clearanceLevel: 'Secret',
    isActive: true,
    lastLogin: '23-Jul-25',
    requestCount: 2,
  },
  {
    id: 'david.garcia.mil',
    firstName: 'David',
    lastName: 'Garcia',
    email: 'david.garcia.mil@airforce.mil',
    role: 'Military',
    organization: 'Other',
    clearanceLevel: 'Top Secret',
    isActive: true,
    lastLogin: '22-Jul-25',
    requestCount: 4,
  },
  {
    id: 'emma.davis.ctr',
    firstName: 'Emma',
    lastName: 'Davis',
    email: 'emma.davis.ctr@marines.mil',
    role: 'Contractor',
    organization: 'CDAO',
    clearanceLevel: 'Secret',
    isActive: true,
    lastLogin: '21-Jul-25',
    requestCount: 2,
  },
  {
    id: 'chris.miller.mil',
    firstName: 'Chris',
    lastName: 'Miller',
    email: 'chris.miller.mil@socom.mil',
    role: 'Military',
    organization: 'DTSA',
    clearanceLevel: 'Top Secret',
    isActive: true,
    lastLogin: '20-Jul-25',
    requestCount: 3,
  },
  {
    id: 'amy.anderson.civ',
    firstName: 'Amy',
    lastName: 'Anderson',
    email: 'amy.anderson.civ@defense.gov',
    role: 'Civilian',
    organization: 'DMPO',
    clearanceLevel: 'Secret',
    isActive: true,
    lastLogin: '19-Jul-25',
    requestCount: 2,
  },
  {
    id: 'ryan.taylor.ctr',
    firstName: 'Ryan',
    lastName: 'Taylor',
    email: 'ryan.taylor.ctr@coast.mil',
    role: 'Contractor',
    organization: 'Space Force',
    clearanceLevel: 'Secret',
    isActive: true,
    lastLogin: '18-Jul-25',
    requestCount: 3,
  },
  {
    id: 'jessica.white.mil',
    firstName: 'Jessica',
    lastName: 'White',
    email: 'jessica.white.mil@army.mil',
    role: 'Military',
    organization: 'Other',
    clearanceLevel: 'Top Secret',
    isActive: true,
    lastLogin: '17-Jul-25',
    requestCount: 2,
  },
  {
    id: 'kevin.martin.civ',
    firstName: 'Kevin',
    lastName: 'Martin',
    email: 'kevin.martin.civ@pentagon.gov',
    role: 'Civilian',
    organization: 'CDAO',
    clearanceLevel: 'Top Secret',
    isActive: true,
    lastLogin: '16-Jul-25',
    requestCount: 4,
  },
];

// Simulate API response with additional metadata
export const mockUsersResponse: UsersResponse = {
  users: mockUsersData,
  totalCount: mockUsersData.length,
  lastUpdated: new Date().toISOString(),
};

// Function to get all users (simulating API call)
export const getAllUsers = (): Promise<UsersResponse> => {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      resolve(mockUsersResponse);
    }, 100); // Simulate network delay
  });
};

// Function to get a single user by ID (simulating API call)
export const getUserById = (userId: string): Promise<UserData | null> => {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      const user = mockUsersData.find(user => user.id === userId);
      resolve(user || null);
    }, 100); // Simulate network delay
  });
};

// Function to get users by organization (simulating API call)
export const getUsersByOrganization = (organization: string): Promise<UserData[]> => {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      const users = mockUsersData.filter(user => user.organization === organization);
      resolve(users);
    }, 100); // Simulate network delay
  });
};

// Function to search users by name or email (simulating API call)
export const searchUsers = (query: string): Promise<UserData[]> => {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      const lowerQuery = query.toLowerCase();
      const users = mockUsersData.filter(user => 
        user.firstName.toLowerCase().includes(lowerQuery) ||
        user.lastName.toLowerCase().includes(lowerQuery) ||
        user.email.toLowerCase().includes(lowerQuery) ||
        user.id.toLowerCase().includes(lowerQuery)
      );
      resolve(users);
    }, 150); // Simulate network delay
  });
};
