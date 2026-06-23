create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  course_id text,
  status text not null default 'ativa',
  teacher text,
  description text,
  start_date date,
  end_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.classes enable row level security;

create trigger update_classes_updated_at
before update on public.classes
for each row execute function public.update_updated_at_column();

create policy "Gestores view all classes"
  on public.classes for select
  using (public.has_role(auth.uid(), 'gestor'));

create policy "Gestores manage classes"
  on public.classes for all
  using (public.has_role(auth.uid(), 'gestor'))
  with check (public.has_role(auth.uid(), 'gestor'));

create table if not exists public.class_enrollments (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'active',
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (class_id, student_id)
);

alter table public.class_enrollments enable row level security;

create trigger update_class_enrollments_updated_at
before update on public.class_enrollments
for each row execute function public.update_updated_at_column();

create policy "Students view own class enrollments"
  on public.class_enrollments for select
  using (auth.uid() = student_id);

create policy "Gestores view all class enrollments"
  on public.class_enrollments for select
  using (public.has_role(auth.uid(), 'gestor'));

create policy "Gestores manage class enrollments"
  on public.class_enrollments for all
  using (public.has_role(auth.uid(), 'gestor'))
  with check (public.has_role(auth.uid(), 'gestor'));

create table if not exists public.student_financial_profiles (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade unique,
  class_id uuid references public.classes(id) on delete set null,
  course_id text,
  billing_model text not null default 'per_lesson',
  agreed_amount numeric(10,2),
  monthly_amount numeric(10,2),
  course_total_amount numeric(10,2),
  discount_amount numeric(10,2) not null default 0,
  discount_type text not null default 'fixed',
  payment_method text not null default 'pix',
  due_day int,
  active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.student_financial_profiles enable row level security;

create trigger update_student_financial_profiles_updated_at
before update on public.student_financial_profiles
for each row execute function public.update_updated_at_column();

create policy "Students view own financial profile"
  on public.student_financial_profiles for select
  using (auth.uid() = student_id);

create policy "Gestores view all financial profiles"
  on public.student_financial_profiles for select
  using (public.has_role(auth.uid(), 'gestor'));

create policy "Gestores manage financial profiles"
  on public.student_financial_profiles for all
  using (public.has_role(auth.uid(), 'gestor'))
  with check (public.has_role(auth.uid(), 'gestor'));

create table if not exists public.financial_charges (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  class_id uuid references public.classes(id) on delete set null,
  course_id text,
  lesson_id uuid references public.lessons(id) on delete set null,
  origin_type text not null default 'manual',
  description text not null,
  reference_date timestamptz not null,
  due_date timestamptz not null,
  amount_gross numeric(10,2) not null,
  discount_amount numeric(10,2) not null default 0,
  amount_net numeric(10,2) not null,
  paid_amount numeric(10,2) not null default 0,
  paid_at timestamptz,
  payment_method text not null default 'not_informed',
  status text not null default 'open',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.financial_charges enable row level security;

create trigger update_financial_charges_updated_at
before update on public.financial_charges
for each row execute function public.update_updated_at_column();

create policy "Students view own financial charges"
  on public.financial_charges for select
  using (auth.uid() = student_id);

create policy "Gestores view all financial charges"
  on public.financial_charges for select
  using (public.has_role(auth.uid(), 'gestor'));

create policy "Gestores manage financial charges"
  on public.financial_charges for all
  using (public.has_role(auth.uid(), 'gestor'))
  with check (public.has_role(auth.uid(), 'gestor'));

create index if not exists idx_class_enrollments_student on public.class_enrollments(student_id, class_id);
create index if not exists idx_student_financial_profiles_student on public.student_financial_profiles(student_id);
create index if not exists idx_financial_charges_student on public.financial_charges(student_id, due_date desc);
create index if not exists idx_financial_charges_lesson on public.financial_charges(lesson_id);
