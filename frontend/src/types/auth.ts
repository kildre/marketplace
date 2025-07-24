// Authentication and authorization types

export interface UserRole {
  name: string;
  description: string;
  permissions: Permission[];
}

export interface Permission {
  resource: string;
  actions: string[];
}

// Define application roles
export enum AppRoles {
  REQUESTOR = "REQUESTOR",
  APPROVER = "APPROVER",
}

// Define permissions
export enum Resources {
  REQUESTS = "requests",
  PRODUCTS = "products",
  APPROVALS = "approvals",
}

export enum Actions {
  CREATE = "create",
  READ = "read",
  UPDATE = "update",
  DELETE = "delete",
  APPROVE = "approve",
  REJECT = "reject",
}

// Role definitions with permissions for future iterations
export const ROLE_PERMISSIONS: Record<AppRoles, Permission[]> = {
  [AppRoles.REQUESTOR]: [
    {
      resource: Resources.REQUESTS,
      actions: [Actions.CREATE, Actions.READ, Actions.UPDATE],
    },
    { resource: Resources.PRODUCTS, actions: [Actions.READ] },
  ],
  [AppRoles.APPROVER]: [
    {
      resource: Resources.REQUESTS,
      actions: [Actions.READ, Actions.UPDATE, Actions.APPROVE, Actions.REJECT],
    },
    { resource: Resources.PRODUCTS, actions: [Actions.READ] },
    {
      resource: Resources.APPROVALS,
      actions: [Actions.READ, Actions.APPROVE, Actions.REJECT],
    },
  ],
};
