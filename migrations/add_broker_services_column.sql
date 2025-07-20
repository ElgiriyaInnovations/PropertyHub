-- Migration: Add needs_broker_services column to properties table
-- This allows sellers to indicate if they need professional broker services

ALTER TABLE properties ADD COLUMN IF NOT EXISTS needs_broker_services BOOLEAN; 