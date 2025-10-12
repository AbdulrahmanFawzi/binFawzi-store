/**
 * 🔑 Login Request Model - BinFawzi Store
 * 
 * Payload structure for authentication via Fake Store API
 */

export interface LoginRequest {
  /** User's username (required) */
  username: string;
  
  /** User's password (required, min 6 characters) */
  password: string;
}

/**
 * 🔐 Login Form Model
 * 
 * Extended version for our reactive form, includes additional UI state
 */
export interface LoginFormModel extends LoginRequest {
  /** Whether to persist the login session in localStorage */
  rememberMe?: boolean;
}