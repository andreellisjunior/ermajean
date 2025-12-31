-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.meal_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  recipe_id integer NOT NULL,
  date date NOT NULL,
  meal_type text NOT NULL CHECK (meal_type = ANY (ARRAY['Breakfast'::text, 'Lunch'::text, 'Dinner'::text])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT meal_plans_pkey PRIMARY KEY (id),
  CONSTRAINT meal_plans_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes(id),
  CONSTRAINT meal_plans_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.notes (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  title text,
  note text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone,
  recipe_id bigint,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  CONSTRAINT notes_pkey PRIMARY KEY (id),
  CONSTRAINT notes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  name text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  email text,
  image text,
  customer_id text,
  price_id text,
  has_access boolean DEFAULT false,
  updated_at timestamp with time zone DEFAULT (now() AT TIME ZONE 'UTC'::text),
  location text,
  calorie_goal integer DEFAULT 2000,
  protein_goal integer DEFAULT 150,
  carb_goal integer DEFAULT 250,
  fat_goal integer DEFAULT 65,
  kid_friendly_preference boolean DEFAULT false,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_user_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.recipe_usage (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  recipe_id bigint,
  source text DEFAULT 'free'::text,
  CONSTRAINT recipe_usage_pkey PRIMARY KEY (id),
  CONSTRAINT recipe_usage_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.recipes (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id uuid DEFAULT gen_random_uuid(),
  recipe_name text,
  description text,
  prep_time text,
  cook_time text,
  total_time text,
  servings text,
  difficulty_level text,
  course text,
  ingredients text,
  instructions text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  est_cost text,
  est_savings text,
  calories integer,
  protein numeric,
  carbs numeric,
  fat numeric,
  fiber numeric,
  sugar numeric,
  sodium integer,
  is_kid_friendly boolean DEFAULT false,
  CONSTRAINT recipes_pkey PRIMARY KEY (id),
  CONSTRAINT recipes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.share_recipes (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  recipe_name text,
  description text,
  prep_time text,
  cook_time text,
  total_time text,
  servings text,
  difficulty_level text,
  course text,
  ingredients text,
  instructions text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  recipe_id bigint,
  calories integer,
  protein numeric,
  carbs numeric,
  fat numeric,
  fiber numeric,
  sugar numeric,
  sodium integer,
  is_kid_friendly boolean DEFAULT false,
  CONSTRAINT share_recipes_pkey PRIMARY KEY (id)
);