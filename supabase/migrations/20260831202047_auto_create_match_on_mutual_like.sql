create or replace function public.create_match_on_mutual_like()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_a uuid;
  v_user_b uuid;
begin
  if exists (select 1 from public.likes l where l.liker_id = new.liked_id and l.liked_id = new.liker_id) then
    v_user_a := least(new.liker_id, new.liked_id);
    v_user_b := greatest(new.liker_id, new.liked_id);
    insert into public.matches (user_a, user_b)
    values (v_user_a, v_user_b)
    on conflict (user_a, user_b) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists likes_create_match_trigger on public.likes;
create trigger likes_create_match_trigger
after insert on public.likes
for each row execute function public.create_match_on_mutual_like();