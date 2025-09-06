// Development mode configuration
// This file switches between real Convex API and mock API based on environment

import { useQuery as useConvexQuery, useMutation as useConvexMutation } from "convex/react";
import { useMockQuery, useMockMutation } from "./mockApi";

// Check if we're in development mode with Convex connection issues
const isDevelopmentMode = import.meta.env.DEV;
const useConvexFallback = false; // Set to true when Convex has network issues

export const useQuery = isDevelopmentMode && useConvexFallback 
  ? useMockQuery 
  : useConvexQuery;

export const useMutation = isDevelopmentMode && useConvexFallback
  ? useMockMutation 
  : useConvexMutation;

// Export mock flag for components to know they're using mock data
export const isMockMode = isDevelopmentMode && useConvexFallback;