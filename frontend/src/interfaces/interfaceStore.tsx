/**
 * Centralized Interface Store
 *
 * This file contains all shared interfaces used throughout the Advana Marketplace application.
 * Organized by functional domain for better maintainability.
 *
 * USAGE EXAMPLES:
 *
 * // Import specific interfaces
 * import { Product, RequestData, FormPersonalInformationProps } from '@/interfaces';
 *
 * // Component usage
 * export const MyComponent: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
 *   // component implementation
 * };
 *
 * MIGRATION NOTES:
 * - All form component props are now centralized here
 * - Product and cart interfaces moved from /types/products
 * - Request and approval interfaces consolidated
 * - Authentication types maintained compatibility with existing @/types/auth
 */

import React from "react";

// ============================================================================
// PRODUCT & CATALOG INTERFACES
// ============================================================================

export type ProductType =
  | "Consumption Based"
  | "License Based"
  | "Consumption Based Tool";

export type CartStatus = "available" | "unavailable";

export interface Product {
  id: number;
  type: ProductType;
  name: string;
  description: string;
  price: number | null; // Price can be null for rom products
  unit: number;
  inCart: boolean;
  currentlyInCart: number;
  cartStatus?: CartStatus;
  rom?: string; // Optional ROM label (e.g., "Custom ROM")
}

export interface ProductItems {
  items: Product[];
  itemCount: number;
  pageCount: number;
  prevPage: number | null;
  nextPage: number | null;
}

export interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onUpdateCartQuantity?: (product: Product, newQuantity: number) => void;
}

// ============================================================================
// CART & ORDER INTERFACES
// ============================================================================

export interface CartItem {
  product: {
    id: number;
    name: string;
    type: string;
    price: number | null;
    description: string;
    unit: string;
    rom: string;
  };
  quantity: number;
}

export interface CartItemData {
  productId: number;
  productName: string;
  productType: string;
  quantity: number;
  price?: number | null;
  description: string;
  unit?: number;
  rom?: string;
}

// ============================================================================
// AUTHENTICATION & AUTHORIZATION INTERFACES
// ============================================================================

export interface UserRole {
  name: string;
  description: string;
  permissions: Permission[];
}

export interface Permission {
  resource: string;
  actions: string[];
}

export enum AppRoles {
  REQUESTOR = "REQUESTOR",
  APPROVER = "APPROVER",
}

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
}

export interface RoleGuardProps {
  roles: AppRoles[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export interface PermissionGuardProps {
  resource: Resources;
  action: Actions;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export interface RequestorOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export interface ApproverOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

// ============================================================================
// FORM DATA INTERFACES
// ============================================================================

export interface PersonalData {
  name: string;
  email: string;
  designation: string;
  agency: string;
}

export interface RequestDetails {
  organization: string;
  organizationOther: string;
  pocName: string;
  pocPhone: string;
  pocEmail: string;
  useCaseDescription: string;
}

export interface OrganizationFormData {
  organization: string;
  organizationOther: string;
}

export interface RequestDetailsFormData {
  pocName: string;
  pocPhone: string;
  pocEmail: string;
  useCaseDescription: string;
}

export interface RequestSummary {
  totalItems: number;
  totalQuantity?: number;
  pendingPriceItems: number;
  estimatedROM: string;
}

export interface SubmissionData {
  requestId: string;
  personalData: PersonalData;
  requestDetails: OrganizationFormData & RequestDetailsFormData;
  cartItems: CartItem[];
  summary: RequestSummary & {
    totalQuantity: number;
    estimatedROM: string | undefined;
  };
  submittedAt: string;
}

// ============================================================================
// REQUEST & APPROVAL INTERFACES
// ============================================================================

export interface RequestData {
  requestId: string;
  personalData: PersonalData;
  requestDetails: RequestDetails;
  cartItems: CartItemData[];
  summary: RequestSummary;
  statusReason: string;
  status: string;
  decisionNumber?: string;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// FORM COMPONENT PROPS INTERFACES
// ============================================================================

export interface FormPersonalInformationProps {
  personalData?: PersonalData;
}

export interface FormCostDetailsProps {
  source?: "cart" | "request";
  summary?: RequestSummary;
}

export interface FormRequestDetailsProps {
  mode?: "edit" | "view";
  viewData?: RequestDetails;
}

export interface FormSelectedApplicationsProps {
  mode?: "edit" | "view";
  viewData?: {
    cartItems: CartItemData[];
    totalItems: number;
  };
}

export interface FormSubmitRequestProps {
  onSubmit?: (data: SubmissionData) => void;
  isLoading?: boolean;
}

// ============================================================================
// COMPOSITE COMPONENT INTERFACES
// ============================================================================

export interface RequestDetailViewProps {
  request: RequestData;
  statusReason: string;
  onReasoningChange?: (event: React.ChangeEvent<{ value: string }>) => void;
  onAccept?: () => void;
  onReject?: () => void;
  buttonClass: string;
  mode: "view" | "edit" | "approve";
}

export interface RequestsTableProps {
  data?: RequestData[];
  userId?: string; // If provided, will filter requests for this specific user (APPROVERs only)
  showUserColumn?: boolean; // Whether to show the User ID column
}

// ============================================================================
// COMMON UI COMPONENT INTERFACES
// ============================================================================

export interface PageTitleProps {
  title: string;
  subtitle?: string;
}

export interface ButtonProps {
  variant?: "primary" | "secondary" | "danger" | "success";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

// ============================================================================
// API & QUERY INTERFACES
// ============================================================================

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface QueryOptions {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filters?: Record<string, string | number | boolean | null>;
}

// ============================================================================
// ENVIRONMENT & CONFIGURATION INTERFACES
// ============================================================================

export interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_KEYCLOAK_URL: string;
  readonly VITE_KEYCLOAK_REALM: string;
  readonly VITE_KEYCLOAK_CLIENT_ID: string;
  readonly MODE: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly SSR: boolean;
}

export interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// ============================================================================
// NOTIFICATION INTERFACES
// ============================================================================

export type NotificationType =
  | "request_submitted"
  | "request_approved"
  | "request_rejected"
  | "request_updated"
  | "system_alert"
  | "general";

export type NotificationPriority = "low" | "medium" | "high" | "urgent";

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  read: boolean;
  createdAt: string; // ISO 8601 timestamp
  actionUrl?: string; // Optional URL to navigate to when notification is clicked
  requestId?: string; // Associated request ID if applicable
  // User associations - determines who can see this notification
  requestorEmail?: string; // Email of the person who submitted the request
  approverEmail?: string; // Email of the approver (for approval/rejection notifications)
  recipientEmails?: string[]; // List of user emails who should see this notification
  metadata?: {
    requestStatus?: string;
    approverName?: string;
    requestorName?: string;
    rejectionReason?: string;
    [key: string]: unknown;
  };
}

export interface NotificationBellProps {
  notifications?: Notification[];
  onNotificationClick?: (notification: Notification) => void;
  onMarkAsRead?: (notificationId: string) => void;
  onMarkAllAsRead?: () => void;
  onClearAll?: () => void;
}
