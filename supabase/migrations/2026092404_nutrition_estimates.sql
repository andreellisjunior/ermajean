begin;
create table public.nutrition_requests(
 id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,
 recipe_id bigint not null references public.recipes(id) on delete cascade,content_version bigint not null,
 status text not null default 'running' check(status in ('running','complete','failed')),
 created_at timestamptz not null default now(),expires_at timestamptz not null default now()+interval '2 minutes'
);
create index nutrition_requests_user_time on public.nutrition_requests(user_id,created_at);
alter table public.nutrition_requests enable row level security;
revoke all on public.nutrition_requests from public,anon,authenticated;
grant all on public.nutrition_requests to service_role;
create or replace function public.begin_nutrition_estimate(p_recipe_id bigint) returns uuid language plpgsql security definer set search_path='' as $$
declare version bigint; token uuid;
begin
 if auth.uid() is null then raise exception 'Authentication required' using errcode='42501';end if;
 perform pg_advisory_xact_lock(hashtextextended('nutrition:'||auth.uid()::text,0));
 select content_version into version from public.recipes where id=p_recipe_id and user_id=auth.uid() for share;
 if not found then raise exception 'Recipe not found' using errcode='P0002';end if;
 if exists(select 1 from public.nutrition_requests where recipe_id=p_recipe_id and user_id=auth.uid() and status='running' and expires_at>now()) then raise exception 'Nutrition calculation already running' using errcode='55P03';end if;
 if (select count(*) from public.nutrition_requests where user_id=auth.uid() and created_at>now()-interval '24 hours')>=10 then raise exception 'Nutrition daily limit reached' using errcode='54000';end if;
 insert into public.nutrition_requests(user_id,recipe_id,content_version) values(auth.uid(),p_recipe_id,version) returning id into token;
 return token;
end $$;
create or replace function public.finish_nutrition_estimate(p_token uuid,p_nutrition jsonb default null) returns boolean language plpgsql security definer set search_path='' as $$
declare request public.nutrition_requests;field text;val numeric;
begin
 if auth.uid() is null then raise exception 'Authentication required' using errcode='42501';end if;
 select * into request from public.nutrition_requests where id=p_token and user_id=auth.uid() for update;
 if not found or request.status<>'running' then return false;end if;
 if p_nutrition is null or request.expires_at<now() then update public.nutrition_requests set status='failed' where id=request.id;return false;end if;
 foreach field in array array['calories','protein','carbs','fat','fiber','sugar','sodium'] loop
  if jsonb_typeof(p_nutrition->field) is distinct from 'number' then raise exception 'Invalid nutrition' using errcode='22023';end if;
  val=(p_nutrition->>field)::numeric;
  if val<0 or val>100000 then raise exception 'Invalid nutrition' using errcode='22023';end if;
 end loop;
 update public.recipes set calories=round((p_nutrition->>'calories')::numeric),protein=(p_nutrition->>'protein')::numeric,carbs=(p_nutrition->>'carbs')::numeric,fat=(p_nutrition->>'fat')::numeric,fiber=(p_nutrition->>'fiber')::numeric,sugar=(p_nutrition->>'sugar')::numeric,sodium=round((p_nutrition->>'sodium')::numeric),nutrition_estimated_at=now()
 where id=request.recipe_id and user_id=auth.uid() and content_version=request.content_version;
 if not found then update public.nutrition_requests set status='failed' where id=request.id;return false;end if;
 update public.nutrition_requests set status='complete' where id=request.id;
 return true;
end $$;
revoke all on function public.begin_nutrition_estimate(bigint),public.finish_nutrition_estimate(uuid,jsonb) from public,anon;
grant execute on function public.begin_nutrition_estimate(bigint),public.finish_nutrition_estimate(uuid,jsonb) to authenticated;
commit;
