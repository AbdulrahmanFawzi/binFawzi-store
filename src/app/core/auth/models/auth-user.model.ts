/**
 * 🧑‍💼 Auth User Model - BinFawzi Store
 * 
 * Represents the authenticated user's profile data.
 * Based on Fake Store API user structure but simplified for educational purposes.
 */

export interface AuthUser {
  /** Unique user identifier from the API */
  id: number;
  
  /** User's login username */
  username: string;
  
  /** User's email address */
  email: string;
  
  /** User's first name */
  firstname: string;
  
  /** User's last name */
  lastname: string;
  
  /** User's phone number (optional) */
  phone?: string;
  
  /** JWT token received from login */
  token: string;
  
  /** When the user logged in (for session tracking) */
  loginTimestamp: Date;
}

/**
 * 🔐 Login Response from Fake Store API
 * 
 * This is what we receive from POST /auth/login
 */
export interface LoginResponse {
  /** JWT token string */
  token: string;
}

/**
 * 🆔 User Profile from Fake Store API
 * 
 * This is what we receive from GET /users/:id
 * We'll merge this with the token to create AuthUser
 */
export interface UserProfile {
  id: number;
  email: string;
  username: string;
  password?: string; // We never store this!
  name: {
    firstname: string;
    lastname: string;
  };
  address?: {
    city: string;
    street: string;
    number: number;
    zipcode: string;
    geolocation: {
      lat: string;
      long: string;
    };
  };
  phone: string;
}