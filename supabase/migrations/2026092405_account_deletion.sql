-- Self-service deletion cannot select another user or leave a paid subscription orphaned.
create or replace function public.delete_user() returns void language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid();
begin
 if uid is null then raise exception 'Authentication required' using errcode='42501'; end if;
 if exists(select 1 from public.profiles where id=uid and (has_access or customer_id is not null)) then raise exception 'Complete billing closure with support before deleting this account' using errcode='55000'; end if;
 delete from public.notes where user_id=uid;
 delete from public.meal_plans where user_id=uid;
 delete from public.share_recipes where user_id=uid;
 delete from public.recipes where user_id=uid;
 delete from public.recipe_usage where user_id=uid;
 delete from public.profiles where id=uid;
 delete from auth.users where id=uid;
end $$;
revoke all on function public.delete_user() from public,anon;
grant execute on function public.delete_user() to authenticated;
