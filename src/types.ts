// Shared domain types used across client and tools

export type SwipeAction = "left" | "right" | "up";

export type RequestStatus =
  | "pending"
  | "awaiting_approval"
  | "denied"
  | "searching"
  | "downloading"
  | "processing"
  | "downloaded"
  | "available"
  | "failed"
  | "cancelled"
  | "awaiting_search"
  | "awaiting_import"
  | "warn";

export type UserRole = "user" | "admin";

export interface UserPermissions {
  interactive_search_access?: boolean;
  download_access?: boolean;
  auto_approve_requests?: boolean;
}

export interface ApiError {
  error?: string;
  message?: string;
}

// Minimal typed shapes for responses we act on in tool descriptions
export interface HealthResponse {
  status: string;
}

export interface VersionResponse {
  version: string;
}
