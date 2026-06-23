create table if not exists public.lesson_financials (
  lesson_id uuid primary key references public.lessons(id) on delete cascade,
  lesson_price numeric(10,2) not null check (lesson_price >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.lesson_financials enable row level security;

create trigger update_lesson_financials_updated_at
before update on public.lesson_financials
for each row execute function public.update_updated_at_column();

create policy "Gestores view lesson financials"
  on public.lesson_financials for select
  using (public.has_role(auth.uid(), 'gestor'));

create policy "Gestores manage lesson financials"
  on public.lesson_financials for all
  using (public.has_role(auth.uid(), 'gestor'))
  with check (public.has_role(auth.uid(), 'gestor'));
