-- Registre des Mariages Religieux — script d'initialisation Supabase.
-- À exécuter dans l'éditeur SQL de votre projet (supabase.com → SQL Editor).

-- Clean reset
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop table if exists public.mariages;
drop table if exists public.personnes;
drop table if exists public.mosquees;
drop table if exists public.profiles;

-- Profils des imams (un par compte)
create table public.profiles (
  id uuid references auth.users(id) primary key,
  nom text not null,
  mosquee text not null,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Les imams voient leur profil" on public.profiles
  for select using (auth.uid() = id);

create policy "Les imams modifient leur profil" on public.profiles
  for update using (auth.uid() = id);

-- Auto-création du profil à l'inscription (comme riverain) :
-- security definer contourne la RLS, donc cela fonctionne quel que soit
-- l'état de la session du client juste après signUp.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, nom, mosquee)
  values (
    new.id,
    new.raw_user_meta_data->>'nom',
    new.raw_user_meta_data->>'mosquee'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Mosquées habilitées à célébrer des mariages
create table public.mosquees (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  ville text not null,
  imam text not null,
  cree_le timestamptz default now()
);

alter table public.mosquees enable row level security;

create policy "Lecture publique des mosquées (invités inclus)" on public.mosquees
  for select to anon, authenticated using (true);

create policy "Les imams connectés ajoutent des mosquées" on public.mosquees
  for insert to authenticated with check (true);

-- Personnes du registre
create table public.personnes (
  id uuid primary key default gen_random_uuid(),
  prenom text not null,
  nom text not null,
  date_naissance date not null,
  sexe text not null check (sexe in ('H', 'F')),
  cree_le timestamptz default now()
);

-- Une même personne = prénom + nom (insensibles à la casse) + date de naissance + sexe
create unique index personnes_identite_unique
  on public.personnes (lower(prenom), lower(nom), date_naissance, sexe);

alter table public.personnes enable row level security;

create policy "Lecture publique des personnes (invités inclus)" on public.personnes
  for select to anon, authenticated using (true);

create policy "Les imams connectés ajoutent des personnes" on public.personnes
  for insert to authenticated with check (true);

-- Mariages religieux
create table public.mariages (
  id uuid primary key default gen_random_uuid(),
  epoux_id uuid not null references public.personnes(id),
  epouse_id uuid not null references public.personnes(id),
  date_mariage date not null,
  lieu text,
  mosquee_id uuid references public.mosquees(id),
  imam text,
  statut text not null default 'actif' check (statut in ('actif', 'divorce', 'veuvage')),
  date_fin date,
  enregistre_par uuid references auth.users(id),
  cree_le timestamptz default now(),
  check (epoux_id <> epouse_id)
);

alter table public.mariages enable row level security;

create policy "Lecture publique des mariages (invités inclus)" on public.mariages
  for select to anon, authenticated using (true);

create policy "Les imams connectés enregistrent des mariages" on public.mariages
  for insert to authenticated with check (true);

create policy "Les imams connectés clôturent des mariages" on public.mariages
  for update to authenticated using (true);
