-- Patakbuhin sa Supabase SQL Editor (isang beses lang)

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  name text not null default '',
  role text not null default 'customer' check (role in ('customer', 'admin'))
);
create table books (
  id bigint generated always as identity primary key,
  title text not null, author text not null, category text not null,
  copies int not null check (copies > 0),
  available int not null check (available >= 0 and available <= copies)
);
create table loans (
  id bigint generated always as identity primary key,
  book_id bigint not null references books on delete cascade,
  user_id uuid not null default auth.uid() references profiles on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'borrowed', 'returned', 'rejected')),
  created_at timestamptz not null default now(),
  due_at timestamptz, returned_at timestamptz
);

-- Pag nag-sign up, auto gawa ng profile. Laging 'customer' ang role, hindi pwedeng galing sa client
create function handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, name) values (new.id, coalesce(new.raw_user_meta_data->>'name', ''));
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();

create function is_admin() returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin')
$$;

-- Mga rules ng loan: availability check, tamang galaw ng status, auto update ng stock at dates
create function loan_guard() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    if (select available from books where id = new.book_id) < 1 then raise exception 'No copies available right now.'; end if;
    if exists (select 1 from loans where user_id = new.user_id and book_id = new.book_id and status in ('pending', 'borrowed')) then
      raise exception 'You already have a request or loan for this book.'; end if;
  else
    if new.book_id <> old.book_id or new.user_id <> old.user_id then raise exception 'Not allowed.'; end if;
    if new.status = old.status then return new; end if;
    if old.status = 'pending' and new.status = 'borrowed' then
      update books set available = available - 1 where id = new.book_id and available > 0;
      if not found then raise exception 'No copies left to lend.'; end if;
      new.due_at := now() + interval '7 days';
    elsif old.status = 'pending' and new.status = 'rejected' then null;
    elsif old.status = 'borrowed' and new.status = 'returned' then
      update books set available = available + 1 where id = new.book_id;
      new.returned_at := now();
    else raise exception 'Invalid status change.'; end if;
  end if;
  return new;
end $$;
create trigger loan_rules before insert or update on loans for each row execute function loan_guard();

-- SECURITY: dito talaga protektado ang admin. Kahit i-hack ang frontend, ang database mismo ang tatanggi
alter table profiles enable row level security;
alter table books enable row level security;
alter table loans enable row level security;

create policy "profile read" on profiles for select using (id = auth.uid() or is_admin());
create policy "books read" on books for select using (true);
create policy "books admin write" on books for all using (is_admin()) with check (is_admin());
create policy "loans read" on loans for select using (user_id = auth.uid() or is_admin());
create policy "loans request" on loans for insert with check (user_id = auth.uid() and status = 'pending');
create policy "loans return" on loans for update using (user_id = auth.uid() and status = 'borrowed') with check (user_id = auth.uid() and status = 'returned');
create policy "loans admin" on loans for update using (is_admin()) with check (is_admin());

-- Sample books
insert into books (title, author, category, copies, available) values
('Noli Me Tangere', 'Jose Rizal', 'Classic', 3, 3),
('El Filibusterismo', 'Jose Rizal', 'Classic', 2, 2),
('Clean Code', 'Robert C. Martin', 'Technology', 2, 2),
('The Pragmatic Programmer', 'Andrew Hunt', 'Technology', 2, 2),
('Atomic Habits', 'James Clear', 'Self-Help', 4, 4),
('The Alchemist', 'Paulo Coelho', 'Fiction', 3, 3),
('Sapiens', 'Yuval Noah Harari', 'History', 2, 2),
('Florante at Laura', 'Francisco Balagtas', 'Classic', 2, 2);
