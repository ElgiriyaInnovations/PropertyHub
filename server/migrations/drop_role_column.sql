-- Migration: Drop role column from users table
-- This removes the role field since roles are now managed in localStorage

ALTER TABLE users DROP COLUMN IF EXISTS role; 