-- Makes each pricing package belong to an editable group on the public pricing page.
ALTER TABLE public.pricing_packages
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'General';

CREATE INDEX IF NOT EXISTS pricing_packages_category_sort_order_idx
  ON public.pricing_packages (category, sort_order);
