-- Apply before billing handlers. Service-role-only ledger and fenced customer leases.
-- Existing duplicate customer mappings must be reviewed; never silently merge accounts.
create unique index if not exists profiles_unique_stripe_customer on public.profiles(customer_id) where customer_id is not null;
create table if not exists public.billing_webhook_events (
 event_id text primary key, customer_id text not null, processed_at timestamptz not null default now()
);
create table if not exists public.billing_webhook_locks (
 customer_id text primary key, token uuid not null, expires_at timestamptz not null
);
alter table public.billing_webhook_events enable row level security;
alter table public.billing_webhook_locks enable row level security;
revoke all on public.billing_webhook_events,public.billing_webhook_locks from anon,authenticated;
grant all on public.billing_webhook_events,public.billing_webhook_locks to service_role;
create or replace function public.begin_billing_event(p_event text,p_customer text,p_token uuid)
returns text language plpgsql security definer set search_path=public as $$
begin
 if exists(select 1 from billing_webhook_events where event_id=p_event) then return 'processed'; end if;
 insert into billing_webhook_locks values(p_customer,p_token,now()+interval '2 minutes')
 on conflict(customer_id) do update set token=excluded.token,expires_at=excluded.expires_at
 where billing_webhook_locks.expires_at<now();
 if not found then return 'busy'; end if;
 return 'acquired';
end;$$;
create or replace function public.finish_billing_event(p_event text,p_customer text,p_token uuid,p_user uuid,p_price text,p_access boolean)
returns void language plpgsql security definer set search_path=public as $$
declare profile_id uuid;
begin
 perform 1 from billing_webhook_locks where customer_id=p_customer and token=p_token and expires_at>now() for update;
 if not found then raise exception 'billing lease expired'; end if;
 select id into profile_id from profiles where customer_id=p_customer;
 if profile_id is null then
  select id into profile_id from profiles where id=p_user and (customer_id is null or customer_id=p_customer) for update;
 end if;
 if profile_id is null then raise exception 'billing profile unavailable'; end if;
 update profiles set customer_id=p_customer,price_id=p_price,has_access=p_access where id=profile_id;
 insert into billing_webhook_events(event_id,customer_id) values(p_event,p_customer) on conflict do nothing;
 delete from billing_webhook_locks where customer_id=p_customer and token=p_token;
end;$$;
create or replace function public.release_billing_event(p_customer text,p_token uuid)
returns void language sql security definer set search_path=public as $$
 delete from billing_webhook_locks where customer_id=p_customer and token=p_token;
$$;
revoke all on function public.begin_billing_event(text,text,uuid),public.finish_billing_event(text,text,uuid,uuid,text,boolean),public.release_billing_event(text,uuid) from public,anon,authenticated;
grant execute on function public.begin_billing_event(text,text,uuid),public.finish_billing_event(text,text,uuid,uuid,text,boolean),public.release_billing_event(text,uuid) to service_role;
