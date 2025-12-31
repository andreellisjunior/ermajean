-- Migration: Add Kid Friendly support
-- Run this in your Supabase SQL Editor

-- Add is_kid_friendly to recipes table
ALTER TABLE public.recipes 
ADD COLUMN IF NOT EXISTS is_kid_friendly boolean DEFAULT false;

-- Add is_kid_friendly to share_recipes table
ALTER TABLE public.share_recipes 
ADD COLUMN IF NOT EXISTS is_kid_friendly boolean DEFAULT false;

-- Add kid_friendly_preference to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS kid_friendly_preference boolean DEFAULT false;
