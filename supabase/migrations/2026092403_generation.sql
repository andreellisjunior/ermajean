-- Trusted server only. Reservations count before provider calls; completed requests replay.
create table public.generation_requests (
 user_id uuid not null references auth.users(id) on delete cascade,
 request_id uuid not null, request_hash text not null,
 status text not null check(status in ('pending','succeeded','failed')),
 source text not null, output jsonb, recipe_id bigint references public.recipes(id) on delete set null,
 created_at timestamptz not null default now(), primary key(user_id,request_id)
);
alter table public.generation_requests enable row level security;
revoke all on public.generation_requests from public,anon,authenticated;
grant all on public.generation_requests to service_role;
create function public.reserve_generation(p_user uuid,p_key uuid,p_hash text) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare r public.generation_requests; p public.profiles; tier text; lim integer; used integer;
begin
 perform pg_advisory_xact_lock(hashtextextended(p_user::text,13));
 -- Provider timeout is 45s; expire abandoned reservations only after a 2-minute safety window.
 update generation_requests set status='failed' where user_id=p_user and status='pending' and created_at<now()-interval '2 minutes';
 select * into r from generation_requests where user_id=p_user and request_id=p_key;
 if found then
  if r.request_hash<>p_hash or r.status='pending' then return jsonb_build_object('status','conflict'); end if;
  if r.status='succeeded' then return jsonb_build_object('status','succeeded','output',r.output); end if;
  -- Failed keys are terminal. A fresh explicit attempt requires a fresh key.
  return jsonb_build_object('status','failed');
 end if;
 select * into p from profiles where id=p_user;
 if not found then return jsonb_build_object('status','limit'); end if;
 tier:=case when not coalesce(p.has_access,false) then 'free' when p.price_id='price_1S1vPoEl9PRnOeq5lBf7pBbo' then 'monthly' when p.price_id='price_1QWp6pEl9PRnOeq5BdPuTmWU' then 'unlimited' else 'unknown' end;
 lim:=case tier when 'free' then 3 when 'monthly' then 8 when 'unlimited' then 2147483647 else 0 end;
 if (select count(*) from generation_requests where user_id=p_user and created_at>now()-interval '1 hour')>=10 then return jsonb_build_object('status','limit'); end if;
 select count(*) into used from generation_requests where user_id=p_user and status in ('pending','succeeded') and
 (tier='free' and source='free' or tier<>'free' and created_at>=date_trunc('month',now() at time zone 'UTC') at time zone 'UTC');
 used:=used+(select count(*) from recipe_usage where user_id=p_user and
 (tier='free' and source='free' or tier<>'free' and created_at>=date_trunc('month',now() at time zone 'UTC') at time zone 'UTC'));
 if used>=lim then return jsonb_build_object('status','limit'); end if;
 insert into generation_requests(user_id,request_id,request_hash,status,source) values(p_user,p_key,p_hash,'pending',tier);
 return jsonb_build_object('status','reserved');
end $$;
create function public.complete_generation(p_user uuid,p_key uuid,p_output jsonb) returns void language plpgsql security definer set search_path=public,pg_temp as $$
begin
 update generation_requests set status='succeeded',output=p_output where user_id=p_user and request_id=p_key and status='pending';
 if not found then raise exception 'Reservation missing'; end if;
end $$;
create function public.fail_generation(p_user uuid,p_key uuid) returns void language sql security definer set search_path=public,pg_temp as $$
 update generation_requests set status='failed' where user_id=p_user and request_id=p_key and status='pending';
$$;
create function public.save_generated_recipe(p_key uuid) returns public.recipes language plpgsql security definer set search_path=public,pg_temp as $$
declare r public.generation_requests; result public.recipes;
begin
 select * into r from generation_requests where user_id=auth.uid() and request_id=p_key for update;
 if not found or r.status<>'succeeded' then raise exception 'Completed generation missing'; end if;
 if r.recipe_id is not null then select * into result from recipes where id=r.recipe_id and user_id=auth.uid(); return result; end if;
 insert into recipes(user_id,recipe_name,description,prep_time,cook_time,total_time,servings,difficulty_level,course,ingredients,instructions,is_kid_friendly)
 values(auth.uid(),r.output->>'recipe_name',r.output->>'description',r.output->>'prep_time',r.output->>'cook_time',r.output->>'total_time',r.output->>'servings',r.output->>'difficulty_level',r.output->>'course',r.output->>'ingredients',r.output->>'instructions',(r.output->>'is_kid_friendly')::boolean) returning * into result;
 update generation_requests set recipe_id=result.id where user_id=auth.uid() and request_id=p_key;
 return result;
end $$;
revoke all on function public.reserve_generation(uuid,uuid,text),public.complete_generation(uuid,uuid,jsonb),public.fail_generation(uuid,uuid),public.save_generated_recipe(uuid) from public,anon,authenticated;
grant execute on function public.reserve_generation(uuid,uuid,text),public.complete_generation(uuid,uuid,jsonb),public.fail_generation(uuid,uuid) to service_role;
grant execute on function public.save_generated_recipe(uuid) to authenticated;
-- Read-only allowance for both clients; include reservations as well as legacy usage.
create function public.generation_allowance() returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare p public.profiles; tier text; lim integer; used integer;
begin
 select * into p from profiles where id=auth.uid();
 if not found then raise exception 'Profile unavailable'; end if;
 tier:=case when not coalesce(p.has_access,false) then 'free' when p.price_id='price_1S1vPoEl9PRnOeq5lBf7pBbo' then 'monthly' when p.price_id='price_1QWp6pEl9PRnOeq5BdPuTmWU' then 'unlimited' else 'unknown' end;
 lim:=case tier when 'free' then 3 when 'monthly' then 8 when 'unlimited' then null else 0 end;
 select count(*) into used from generation_requests where user_id=auth.uid() and status in ('pending','succeeded') and
 (tier='free' and source='free' or tier<>'free' and created_at>=date_trunc('month',now() at time zone 'UTC') at time zone 'UTC');
 used:=used+(select count(*) from recipe_usage where user_id=auth.uid() and
 (tier='free' and source='free' or tier<>'free' and created_at>=date_trunc('month',now() at time zone 'UTC') at time zone 'UTC'));
 return jsonb_build_object('access',tier in ('monthly','unlimited'),'plan',tier,'recipe_limit',lim,'used',used,'remaining',case when lim is null then null else greatest(0,lim-used) end);
end $$;
revoke all on function public.generation_allowance() from public,anon;
grant execute on function public.generation_allowance() to authenticated;
