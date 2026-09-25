-- Review and apply in staging first. This migration does not modify the reference schema file.
begin;
-- Do not silently discard an existing conflicting plan. Resolve these in staging before retrying.
do $$ begin
 if exists(select 1 from public.meal_plans group by user_id,date,meal_type having count(*)>1) then
  raise exception 'Duplicate meal slots exist. Review SELECT user_id,date,meal_type,count(*) FROM public.meal_plans GROUP BY 1,2,3 HAVING count(*)>1 before migration.';
 end if;
end $$;

-- Remove permissive legacy policies; PostgreSQL ORs permissive policies together.
do $$ declare p record; begin
 for p in select schemaname,tablename,policyname from pg_policies where schemaname='public' and tablename in ('profiles','recipes','notes','meal_plans','recipe_usage','share_recipes') loop
  execute format('drop policy %I on %I.%I',p.policyname,p.schemaname,p.tablename);
 end loop;
end $$;
alter table public.profiles enable row level security;
alter table public.recipes enable row level security;
alter table public.notes enable row level security;
alter table public.meal_plans enable row level security;
alter table public.recipe_usage enable row level security;
alter table public.share_recipes enable row level security;
revoke all on public.profiles,public.recipes,public.notes,public.meal_plans,public.recipe_usage,public.share_recipes from public,anon,authenticated;
grant select on public.profiles to authenticated;
grant insert(id,name,email,location,image,calorie_goal,protein_goal,carb_goal,fat_goal,kid_friendly_preference) on public.profiles to authenticated;
grant update(name,location,image,calorie_goal,protein_goal,carb_goal,fat_goal,kid_friendly_preference,updated_at) on public.profiles to authenticated;
grant select,insert,update,delete on public.recipes,public.notes,public.meal_plans to authenticated;
grant select on public.recipe_usage to authenticated;
grant select on public.share_recipes to anon,authenticated;
grant all on public.profiles,public.recipes,public.notes,public.meal_plans,public.recipe_usage,public.share_recipes to service_role;
-- Identity sequences are needed for direct mobile inserts; no ownership is inferred from sequence values.
grant usage,select on sequence public.recipes_id_seq,public.notes_id_seq to authenticated;
create policy profiles_read on public.profiles for select to authenticated using (id=(select auth.uid()));
create policy profiles_insert on public.profiles for insert to authenticated with check(id=(select auth.uid()));
create policy profiles_update on public.profiles for update to authenticated using(id=(select auth.uid())) with check(id=(select auth.uid()));
create policy recipes_owner on public.recipes for all to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create policy notes_owner on public.notes for all to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()) and exists(select 1 from public.recipes r where r.id=recipe_id and r.user_id=(select auth.uid())));
create policy meal_plans_owner on public.meal_plans for all to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()) and exists(select 1 from public.recipes r where r.id=recipe_id and r.user_id=(select auth.uid())));
create policy recipe_usage_read on public.recipe_usage for select to authenticated using(user_id=(select auth.uid()));

-- Invoker trigger: a user may edit personal settings but cannot grant themselves billing access.
create or replace function public.protect_profile_entitlements() returns trigger language plpgsql set search_path='' as $$
begin
 if current_user in ('postgres','supabase_admin','service_role') or coalesce(auth.role(),'')='service_role' then return new; end if;
 if tg_op='INSERT' then
  if coalesce(new.has_access,false) or new.customer_id is not null or new.price_id is not null then raise exception 'Billing fields are server managed' using errcode='42501'; end if;
 elsif new.id is distinct from old.id or new.has_access is distinct from old.has_access or new.customer_id is distinct from old.customer_id or new.price_id is distinct from old.price_id then
  raise exception 'Billing fields are server managed' using errcode='42501';
 end if;
 return new;
end $$;
drop trigger if exists protect_profile_entitlements on public.profiles;
create trigger protect_profile_entitlements before insert or update on public.profiles for each row execute function public.protect_profile_entitlements();
revoke all on function public.protect_profile_entitlements() from public,anon,authenticated;

alter table public.recipes alter column user_id set default auth.uid();
alter table public.recipes add column if not exists content_version bigint not null default 1;
alter table public.recipes add column if not exists nutrition_estimated_at timestamptz;
create or replace function public.invalidate_recipe_nutrition() returns trigger language plpgsql set search_path='' as $$
begin
 if new.ingredients is distinct from old.ingredients or new.instructions is distinct from old.instructions or new.servings is distinct from old.servings then
  new.content_version=old.content_version+1;
  new.calories=null;new.protein=null;new.carbs=null;new.fat=null;new.fiber=null;new.sugar=null;new.sodium=null;new.nutrition_estimated_at=null;
 else new.content_version=old.content_version;
 end if;
 return new;
end $$;
drop trigger if exists invalidate_recipe_nutrition on public.recipes;
create trigger invalidate_recipe_nutrition before update on public.recipes for each row execute function public.invalidate_recipe_nutrition();
revoke all on function public.invalidate_recipe_nutrition() from public,anon,authenticated;

create unique index if not exists meal_plans_owner_slot on public.meal_plans(user_id,date,meal_type);
create index if not exists recipes_owner_created on public.recipes(user_id,created_at desc);
create index if not exists notes_owner_recipe on public.notes(user_id,recipe_id);
create index if not exists usage_owner_created on public.recipe_usage(user_id,created_at);

-- Publication is an explicit snapshot. Unresolvable legacy snapshots stay private.
alter table public.share_recipes add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.share_recipes add column if not exists published boolean not null default false;
update public.share_recipes s set user_id=r.user_id,published=true from public.recipes r where s.recipe_id=r.id and s.user_id is null;
create policy shared_public_read on public.share_recipes for select to anon,authenticated using(published and user_id is not null);
create index if not exists share_recipe_lookup on public.share_recipes(recipe_id) where published;

create or replace function public.publish_recipe(p_recipe_id bigint) returns public.share_recipes language plpgsql security definer set search_path='' as $$
declare r public.recipes; result public.share_recipes;
begin
 if auth.uid() is null then raise exception 'Authentication required' using errcode='42501'; end if;
 select * into r from public.recipes where id=p_recipe_id and user_id=auth.uid() for update;
 if not found then raise exception 'Recipe not found' using errcode='P0002'; end if;
 delete from public.share_recipes where recipe_id=r.id;
 insert into public.share_recipes(recipe_id,user_id,published,recipe_name,description,prep_time,cook_time,total_time,servings,difficulty_level,course,ingredients,instructions,calories,protein,carbs,fat,fiber,sugar,sodium,is_kid_friendly)
 values(r.id,auth.uid(),true,r.recipe_name,r.description,r.prep_time,r.cook_time,r.total_time,r.servings,r.difficulty_level,r.course,r.ingredients,r.instructions,r.calories,r.protein,r.carbs,r.fat,r.fiber,r.sugar,r.sodium,r.is_kid_friendly) returning * into result;
 return result;
end $$;
create or replace function public.revoke_recipe(p_recipe_id bigint) returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'Authentication required' using errcode='42501'; end if;
 perform 1 from public.recipes where id=p_recipe_id and user_id=auth.uid() for update;
 if not found then raise exception 'Recipe not found' using errcode='P0002'; end if;
 delete from public.share_recipes where recipe_id=p_recipe_id;
end $$;

-- Clean dependants in the same transaction even when a mobile client directly deletes a recipe.
create or replace function public.cleanup_recipe_dependants() returns trigger language plpgsql security definer set search_path='' as $$
begin
 delete from public.notes where recipe_id=old.id;
 delete from public.meal_plans where recipe_id=old.id;
 delete from public.share_recipes where recipe_id=old.id;
 -- Usage is intentionally retained: deleting a recipe must not reset its AI allowance.
 return old;
end $$;
drop trigger if exists cleanup_recipe_dependants on public.recipes;
create trigger cleanup_recipe_dependants before delete on public.recipes for each row execute function public.cleanup_recipe_dependants();
revoke all on function public.cleanup_recipe_dependants() from public,anon,authenticated;
create or replace function public.delete_owned_recipe(p_recipe_id bigint) returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'Authentication required' using errcode='42501'; end if;
 delete from public.recipes where id=p_recipe_id and user_id=auth.uid();
 if not found then raise exception 'Recipe not found' using errcode='P0002'; end if;
end $$;

-- All assignments serialize for one user. No delete-then-insert window, no lost source on move.
create or replace function public.replace_meal_plan(p_date date,p_meal_type text,p_recipe_id bigint,p_move_id uuid default null) returns public.meal_plans language plpgsql security definer set search_path='' as $$
declare result public.meal_plans;
begin
 if auth.uid() is null then raise exception 'Authentication required' using errcode='42501'; end if;
 if p_date is null or p_meal_type not in ('Breakfast','Lunch','Dinner') or p_meal_type is null then raise exception 'Invalid meal slot' using errcode='22023'; end if;
 perform pg_advisory_xact_lock(hashtextextended('meal-plan:'||auth.uid()::text,0));
 perform 1 from public.recipes where id=p_recipe_id and user_id=auth.uid() for key share;
 if not found then raise exception 'Recipe not found' using errcode='P0002'; end if;
 if p_move_id is not null then
  perform 1 from public.meal_plans where id=p_move_id and user_id=auth.uid() for update;
  if not found then raise exception 'Meal not found' using errcode='P0002'; end if;
  if exists(select 1 from public.meal_plans where user_id=auth.uid() and date=p_date and meal_type=p_meal_type and id<>p_move_id) then raise exception 'Destination already has a meal' using errcode='23505'; end if;
  update public.meal_plans set date=p_date,meal_type=p_meal_type,recipe_id=p_recipe_id,updated_at=now() where id=p_move_id and user_id=auth.uid() returning * into result;
 else
  insert into public.meal_plans(user_id,date,meal_type,recipe_id) values(auth.uid(),p_date,p_meal_type,p_recipe_id)
  on conflict(user_id,date,meal_type) do update set recipe_id=excluded.recipe_id,updated_at=now() returning * into result;
 end if;
 return result;
end $$;
revoke all on function public.publish_recipe(bigint),public.revoke_recipe(bigint),public.delete_owned_recipe(bigint),public.replace_meal_plan(date,text,bigint,uuid) from public,anon;
grant execute on function public.publish_recipe(bigint),public.revoke_recipe(bigint),public.delete_owned_recipe(bigint),public.replace_meal_plan(date,text,bigint,uuid) to authenticated;

create table if not exists public.shopping_items(
 id uuid primary key default gen_random_uuid(),user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 week_start date not null,item_key text not null check(length(item_key) between 1 and 500),label text not null check(length(label) between 1 and 2000),
 checked boolean not null default false,manual boolean not null default false,quantity text not null default '',unit text not null default '',updated_at timestamptz not null default now(),
 unique(user_id,week_start,item_key)
);
alter table public.shopping_items enable row level security;
revoke all on public.shopping_items from public,anon,authenticated;
grant select,insert,update,delete on public.shopping_items to authenticated;
grant all on public.shopping_items to service_role;
create policy shopping_owner on public.shopping_items for all to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
commit;
