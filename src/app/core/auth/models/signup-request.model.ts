/**
 * 📝 Signup Request Model - BinFawzi Store
 * 
 * Payload structure for user registration via Fake Store API
 * Note: This is educational - Fake Store API creates a mock user but doesn't persist data
 */

export interface SignupRequest {
  /** User's email address */
  email: string;
  
  /** Chosen username */
  username: string;
  
  /** Password (will be validated on frontend) */
  password: string;
  
  /** User's first name (optional) */
  firstname?: string;
  
  /** User's last name (optional) */
  lastname?: string;
  
  /** User's phone number (optional) */
  phone?: string;
}

/**
 * 📤 Signup Response from Fake Store API
 * 
 * What we receive after POST /users
 */
export interface SignupResponse {
  /** Generated user ID (fake, won't persist) */
  id: number;
}