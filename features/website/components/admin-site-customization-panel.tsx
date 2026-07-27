'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { ArrowDown, ArrowUp, Camera, ImageIcon, Loader2, Plus, Save, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PricingPackagesEditor } from './pricing-packages-editor';
import { defaultSiteContent } from '@/features/website/defaults';
import {
  fetchAllSiteContent,
  saveSiteContent,
} from '@/features/website/api/site-content';
import {
  defaultSiteSettings,
  fetchSiteSettings,
  fontOptions,
  saveSiteSettings,
  themeStyleFromColors,
  type SiteCustomizationSettings,
} from '@/features/website/site-settings';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import type { SiteContentMap } from '@/features/website/types';
import type { Category, Service, TeamMember, Testimonial } from '@/types';

type AdminSiteCustomizationPanelProps = {
  userId: string;
};

const heroImageFitOptions = [
  { value: 'cover', label: 'Fill frame (crop edges)' },
  { value: 'contain', label: 'Show full image' },
] as const;

const heroImagePositionOptions = [
  { value: 'center', label: 'Center' },
  { value: 'top', label: 'Top' },
  { value: 'bottom', label: 'Bottom' },
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
  { value: 'left top', label: 'Top left' },
  { value: 'right top', label: 'Top right' },
  { value: 'left bottom', label: 'Bottom left' },
  { value: 'right bottom', label: 'Bottom right' },
] as const;

function defaultImageAdjustment() {
  return { imageFit: 'cover' as const, imagePosition: 'center' as const };
}

function FieldGroup({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function StringListEditor({
  values,
  onChange,
  placeholder,
}: {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}) {
  const rows = values.length ? values : [''];

  return (
    <div className="space-y-2">
      {rows.map((value, index) => (
        <div key={index} className="flex gap-2">
          <Input
            value={value}
            placeholder={placeholder}
            onChange={(event) => {
              const next = [...rows];
              next[index] = event.target.value;
              onChange(next);
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => onChange(rows.filter((_, i) => i !== index))}
            disabled={rows.length === 1}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...rows, ''])}>
        <Plus className="h-4 w-4 mr-2" /> Add line
      </Button>
    </div>
  );
}

async function uploadWebsiteAsset(file: File, folder: string): Promise<string> {
  const extension = file.name.split('.').pop() || 'asset';
  const path = `${folder}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from('website-assets').upload(path, file, {
    upsert: true,
    contentType: file.type,
  });
  if (error) throw error;
  const { data } = supabase.storage.from('website-assets').getPublicUrl(path);
  return data.publicUrl;
}

function isMissingTeamMemberCmsColumn(error: { code?: string; message?: string } | null) {
  return (
    error?.code === 'PGRST204' &&
    /'(?:photo_url|social_links)' column of 'team_members'/i.test(error.message ?? '')
  );
}

export function AdminSiteCustomizationPanel({ userId }: AdminSiteCustomizationPanelProps) {
  const [settings, setSettings] = useState<SiteCustomizationSettings>(defaultSiteSettings);
  const [content, setContent] = useState<SiteContentMap>(defaultSiteContent);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const previewStyle = useMemo(
    () => themeStyleFromColors(settings.themeColors),
    [settings.themeColors],
  );

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    const [siteSettings, siteContent, { data: testimonialData }, { data: teamData }, { data: categoryData }, { data: serviceData }] = await Promise.all([
      fetchSiteSettings(),
      fetchAllSiteContent(),
      supabase.from('testimonials').select('*').order('created_at', { ascending: false }),
      supabase.from('team_members').select('*').order('sort_order'),
      supabase.from('categories').select('*').order('sort_order'),
      supabase.from('services').select('*').order('sort_order'),
    ]);
    setSettings(siteSettings);
    setContent(siteContent);
    setTestimonials((testimonialData as Testimonial[]) ?? []);
    setTeamMembers((teamData as TeamMember[]) ?? []);
    setCategories((categoryData as Category[]) ?? []);
    setServices((serviceData as Service[]) ?? []);
    setLoading(false);
  }

  async function saveSettings(section: string, nextSettings = settings) {
    setSaving(section);
    const { error } = await saveSiteSettings(nextSettings, userId);
    setSaving(null);
    if (error) {
      toast({ title: 'Save failed', description: error, variant: 'destructive' });
      return false;
    }
    toast({ title: 'Saved', description: `${section} settings are live.` });
    return true;
  }

  async function saveContent<K extends keyof SiteContentMap>(key: K, label: string) {
    setSaving(key);
    const { error } = await saveSiteContent(key, content[key], userId);
    setSaving(null);
    if (error) {
      toast({ title: 'Save failed', description: error, variant: 'destructive' });
      return;
    }
    toast({ title: 'Saved', description: `${label} content is live.` });
  }

  async function saveTestimonial(testimonial: Partial<Testimonial>, index: number) {
    if (!testimonial.client_name?.trim() || !testimonial.content?.trim()) {
      toast({ title: 'Missing testimonial fields', description: 'Client name and quote are required.', variant: 'destructive' });
      return;
    }
    setSaving(`testimonial-${index}`);
    const payload = {
      client_name: testimonial.client_name.trim(),
      client_title: testimonial.client_title || null,
      content: testimonial.content.trim(),
      rating: Number(testimonial.rating) || 5,
      image_url: testimonial.image_url || null,
      is_featured: !!testimonial.is_featured,
    };
    const result = testimonial.id
      ? await supabase.from('testimonials').update(payload).eq('id', testimonial.id)
      : await supabase.from('testimonials').insert([payload]);
    setSaving(null);
    if (result.error) {
      toast({ title: 'Save failed', description: result.error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Testimonial saved' });
    loadAll();
  }

  async function deleteTestimonial(id: string) {
    const { error } = await supabase.from('testimonials').delete().eq('id', id);
    if (error) {
      toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Testimonial removed' });
    loadAll();
  }

  async function saveTeamMember(member: Partial<TeamMember>, index: number) {
    if (!member.name?.trim() || !member.role?.trim()) {
      toast({ title: 'Missing team fields', description: 'Name and role are required.', variant: 'destructive' });
      return;
    }

    setSaving(`team-${index}`);
    const photoUrl = member.photo_url || member.image_url || null;
    const payload = {
      name: member.name.trim(),
      role: member.role.trim(),
      bio: member.bio?.trim() || null,
      photo_url: photoUrl,
      image_url: photoUrl,
      social_links: {
        instagram: member.social_links?.instagram?.trim() || '',
        tiktok: member.social_links?.tiktok?.trim() || '',
      },
      sort_order: Number(member.sort_order) || 0,
      is_active: member.is_active ?? true,
    };

    let result = member.id
      ? await supabase.from('team_members').update(payload).eq('id', member.id)
      : await supabase.from('team_members').insert([payload]);

    if (isMissingTeamMemberCmsColumn(result.error)) {
      const legacyPayload = {
        name: payload.name,
        role: payload.role,
        bio: payload.bio,
        image_url: payload.image_url,
        sort_order: payload.sort_order,
        is_active: payload.is_active,
      };

      result = member.id
        ? await supabase.from('team_members').update(legacyPayload).eq('id', member.id)
        : await supabase.from('team_members').insert([legacyPayload]);
    }

    setSaving(null);

    if (result.error) {
      toast({ title: 'Save failed', description: result.error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Team member saved' });
    loadAll();
  }

  async function deleteTeamMember(id: string) {
    const { error } = await supabase.from('team_members').delete().eq('id', id);
    if (error) {
      toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Team member removed' });
    loadAll();
  }

  async function moveTeamMember(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= teamMembers.length) return;

    const next = [...teamMembers];
    const current = { ...next[index], sort_order: next[targetIndex].sort_order };
    const target = { ...next[targetIndex], sort_order: next[index].sort_order };
    next[index] = target;
    next[targetIndex] = current;
    setTeamMembers(next);

    const updates = [current, target].filter((member) => member.id);
    setSaving('team-order');
    const results = await Promise.all(
      updates.map((member) =>
        supabase
          .from('team_members')
          .update({ sort_order: member.sort_order })
          .eq('id', member.id),
      ),
    );
    const error = results.find((result) => result.error)?.error;
    setSaving(null);

    if (error) {
      toast({ title: 'Reorder failed', description: error.message, variant: 'destructive' });
      loadAll();
      return;
    }
    toast({ title: 'Team order updated' });
    loadAll();
  }

  async function saveCategory(category: Partial<Category>, index: number) {
    if (!category.name?.trim()) {
      toast({ title: 'Category name required', description: 'Enter a category name.', variant: 'destructive' });
      return;
    }

    setSaving(`category-${index}`);
    const slug = (category.slug || category.name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const payload = {
      name: category.name.trim(),
      slug,
      description: category.description || null,
      image_url: category.image_url || null,
      sort_order: Number(category.sort_order) || 0,
    };
    const result = category.id
      ? await supabase.from('categories').update(payload).eq('id', category.id)
      : await supabase.from('categories').insert([payload]);
    setSaving(null);

    if (result.error) {
      toast({ title: 'Save failed', description: result.error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Category saved' });
    loadAll();
  }

  async function deleteCategory(id: string) {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Category removed' });
    loadAll();
  }

  function getCategoryImageAdjustment(categoryId: string) {
    return categoryId
      ? settings.serviceCategoryImages[categoryId] ?? defaultImageAdjustment()
      : defaultImageAdjustment();
  }

  function updateCategoryImageAdjustment(
    categoryId: string,
    patch: Partial<ReturnType<typeof defaultImageAdjustment>>,
  ) {
    if (!categoryId) {
      toast({
        title: 'Save category first',
        description: 'Create the category before setting image fit and position.',
      });
      return;
    }

    setSettings({
      ...settings,
      serviceCategoryImages: {
        ...settings.serviceCategoryImages,
        [categoryId]: {
          ...getCategoryImageAdjustment(categoryId),
          ...patch,
        },
      },
    });
  }

  async function saveService(service: Partial<Service>, index: number) {
    if (!service.name?.trim()) {
      toast({ title: 'Service name required', description: 'Enter a service name.', variant: 'destructive' });
      return;
    }

    const price = service.starting_price === null || service.starting_price === undefined
      ? null
      : Number(service.starting_price);
    if (price !== null && price < 0) {
      toast({ title: 'Invalid price', description: 'Starting price cannot be negative.', variant: 'destructive' });
      return;
    }

    setSaving(`service-${index}`);
    const payload = {
      category_id: service.category_id || null,
      name: service.name.trim(),
      description: service.description || null,
      features: (service.features ?? []).map((feature) => feature.trim()).filter(Boolean),
      starting_price: price,
      image_url: service.image_url || null,
      sort_order: Number(service.sort_order) || 0,
    };
    const result = service.id
      ? await supabase.from('services').update(payload).eq('id', service.id)
      : await supabase.from('services').insert([payload]);
    setSaving(null);

    if (result.error) {
      toast({ title: 'Save failed', description: result.error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Service saved', description: `${service.name} is live on the Services page.` });
    loadAll();
  }

  async function deleteService(id: string) {
    const { error } = await supabase.from('services').delete().eq('id', id);
    if (error) {
      toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Service removed' });
    loadAll();
  }

  async function uploadAndSet(
    file: File | undefined,
    folder: string,
    applyUrl: (url: string) => SiteCustomizationSettings | SiteContentMap,
    section: string,
  ) {
    if (!file) return;
    setSaving(section);
    try {
      const url = await uploadWebsiteAsset(file, folder);
      const next = applyUrl(url);
      if ('themeColors' in next) {
        setSettings(next);
        await saveSettings(section, next);
      } else {
        setContent(next);
        const contentKeyByFolder: Partial<Record<string, keyof SiteContentMap>> = {
          homepage: 'home',
          about: 'about',
          services: 'services',
          business: 'business',
        };
        const key = contentKeyByFolder[folder] ?? 'business';
        await saveSiteContent(key, next[key], userId);
        toast({ title: 'Uploaded', description: `${section} asset is live.` });
      }
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Unable to upload asset.',
        variant: 'destructive',
      });
    } finally {
      setSaving(null);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const business = content.business;
  const home = content.home;
  const about = content.about;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Site Customization</h2>
        <p className="text-muted-foreground">
          Edit live website settings without touching code. Changes save to Supabase and render on the public site.
        </p>
      </div>

      <Tabs defaultValue="colors" className="space-y-6">
        <TabsList className="flex h-auto flex-wrap gap-1">
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="homepage">Homepage</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="business">Business Info</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="toggles">Feature Toggles</TabsTrigger>
          <TabsTrigger value="watermarking">Watermarking</TabsTrigger>
        </TabsList>

        <TabsContent value="colors">
          <Card>
            <CardHeader>
              <CardTitle>Brand Colors</CardTitle>
              <CardDescription>Tailwind color utilities read these CSS variables after the site loads.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 lg:grid-cols-[1fr_320px]">
              <div className="grid sm:grid-cols-2 gap-4">
                {Object.entries(settings.themeColors).map(([key, value]) => (
                  <FieldGroup key={key} label={key.charAt(0).toUpperCase() + key.slice(1)}>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={value}
                        onChange={(event) =>
                          setSettings({
                            ...settings,
                            themeColors: { ...settings.themeColors, [key]: event.target.value },
                          })
                        }
                        className="h-10 w-14 p-1"
                      />
                      <Input
                        value={value}
                        onChange={(event) =>
                          setSettings({
                            ...settings,
                            themeColors: { ...settings.themeColors, [key]: event.target.value },
                          })
                        }
                      />
                    </div>
                  </FieldGroup>
                ))}
                <Button onClick={() => saveSettings('Color')} disabled={saving === 'Color'}>
                  {saving === 'Color' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save colors
                </Button>
              </div>
              <div style={previewStyle} className="rounded-lg border bg-card p-5">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
                    <Camera className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-semibold">Rub Shoots Preview</p>
                    <p className="text-sm text-muted-foreground">Buttons, badges, and accents</p>
                  </div>
                </div>
                <Button className="w-full">Primary action</Button>
                <div className="mt-4 rounded-md bg-accent p-3 text-sm text-accent-foreground">
                  Accent surface preview
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing">
          <PricingPackagesEditor />
        </TabsContent>

        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <CardTitle>Branding</CardTitle>
              <CardDescription>Logo, favicon, and curated typography settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border bg-muted/20 p-5">
                <p className="mb-3 text-sm font-medium">Logo preview</p>
                <div className="flex min-h-24 items-center rounded-md bg-background px-5">
                  {settings.branding.logoUrl ? (
                    <div className="relative h-20 w-56">
                      <Image
                        src={settings.branding.logoUrl}
                        alt="Rub Shoots logo preview"
                        fill
                        className="object-contain object-left"
                        sizes="224px"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Camera className="h-6 w-6 text-primary" />
                      </span>
                      <div>
                        <p className="font-[family-name:var(--font-playfair)] text-xl font-bold">Rub Shoots</p>
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Photography Studio</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <FieldGroup label="Logo URL">
                  <Input
                    value={settings.branding.logoUrl}
                    onChange={(event) => setSettings({ ...settings, branding: { ...settings.branding, logoUrl: event.target.value } })}
                  />
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(event) => uploadAndSet(event.target.files?.[0], 'branding', (url) => ({
                      ...settings,
                      branding: { ...settings.branding, logoUrl: url },
                    }), 'Logo')}
                  />
                </FieldGroup>
                <FieldGroup label="Favicon URL">
                  <Input
                    value={settings.branding.faviconUrl}
                    onChange={(event) => setSettings({ ...settings, branding: { ...settings.branding, faviconUrl: event.target.value } })}
                  />
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(event) => uploadAndSet(event.target.files?.[0], 'branding', (url) => ({
                      ...settings,
                      branding: { ...settings.branding, faviconUrl: url },
                    }), 'Favicon')}
                  />
                </FieldGroup>
                <FieldGroup label="Heading font">
                  <Select value={settings.branding.headingFont} onValueChange={(headingFont) => setSettings({ ...settings, branding: { ...settings.branding, headingFont } })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{fontOptions.map((font) => <SelectItem key={font} value={font}>{font}</SelectItem>)}</SelectContent>
                  </Select>
                </FieldGroup>
                <FieldGroup label="Body font">
                  <Select value={settings.branding.bodyFont} onValueChange={(bodyFont) => setSettings({ ...settings, branding: { ...settings.branding, bodyFont } })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{fontOptions.map((font) => <SelectItem key={font} value={font}>{font}</SelectItem>)}</SelectContent>
                  </Select>
                </FieldGroup>
              </div>
              <Button onClick={() => saveSettings('Branding')} disabled={saving === 'Branding'}>
                <Save className="h-4 w-4 mr-2" /> Save branding
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="homepage">
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Homepage Hero</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <FieldGroup label="Hero headline"><Input value={home.hero.title} onChange={(event) => setContent({ ...content, home: { ...home, hero: { ...home.hero, title: event.target.value } } })} /></FieldGroup>
                <FieldGroup label="Hero subtitle"><Textarea rows={2} value={home.hero.subtitle} onChange={(event) => setContent({ ...content, home: { ...home, hero: { ...home.hero, subtitle: event.target.value } } })} /></FieldGroup>
                <FieldGroup label="Hero image URL">
                  <div className="flex gap-2">
                    <Input value={home.hero.imageUrl} onChange={(event) => setContent({ ...content, home: { ...home, hero: { ...home.hero, imageUrl: event.target.value } } })} />
                    <Button variant="outline" size="icon" asChild><label><Upload className="h-4 w-4" /><Input className="hidden" type="file" accept="image/*" onChange={(event) => uploadAndSet(event.target.files?.[0], 'homepage', (url) => ({ ...content, home: { ...home, hero: { ...home.hero, imageUrl: url } } }), 'Homepage')} /></label></Button>
                  </div>
                </FieldGroup>
                <div className="grid sm:grid-cols-2 gap-4">
                  <FieldGroup label="Image fit" hint="Use Fill for photos that can crop. Use Show full image for banners, posters, or logos.">
                    <Select
                      value={home.hero.imageFit}
                      onValueChange={(imageFit) =>
                        setContent({
                          ...content,
                          home: { ...home, hero: { ...home.hero, imageFit: imageFit as typeof home.hero.imageFit } },
                        })
                      }
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {heroImageFitOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FieldGroup>
                  <FieldGroup label="Image position" hint="Choose which part of the image stays visible when Fill crops it.">
                    <Select
                      value={home.hero.imagePosition}
                      onValueChange={(imagePosition) =>
                        setContent({
                          ...content,
                          home: { ...home, hero: { ...home.hero, imagePosition: imagePosition as typeof home.hero.imagePosition } },
                        })
                      }
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {heroImagePositionOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FieldGroup>
                </div>
                <div className="overflow-hidden rounded-lg border bg-neutral-950">
                  <div className="relative aspect-[16/7]">
                    <Image
                      src={home.hero.imageUrl}
                      alt="Homepage hero preview"
                      fill
                      className="object-center"
                      style={{
                        objectFit: home.hero.imageFit,
                        objectPosition: home.hero.imagePosition,
                      }}
                      sizes="720px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/20 to-black/45" />
                    <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/80">{home.hero.badge}</p>
                      <p className="mt-1 font-[family-name:var(--font-playfair)] text-2xl font-bold">{home.hero.title}</p>
                    </div>
                  </div>
                </div>
                <Button onClick={() => saveContent('home', 'Homepage')}><Save className="h-4 w-4 mr-2" /> Save homepage</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Testimonials</CardTitle>
                  <CardDescription>Add, edit, remove, and feature homepage testimonials.</CardDescription>
                </div>
                <Button size="sm" onClick={() => setTestimonials([{ id: '', client_name: '', client_title: '', content: '', rating: 5, image_url: '', is_featured: true, created_at: '' }, ...testimonials])}>
                  <Plus className="h-4 w-4 mr-2" /> Add
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {testimonials.map((testimonial, index) => (
                  <div key={testimonial.id || `new-${index}`} className="rounded-lg border p-4 space-y-3">
                    <div className="grid sm:grid-cols-2 gap-3">
                      <Input placeholder="Client name" value={testimonial.client_name} onChange={(event) => {
                        const next = [...testimonials];
                        next[index] = { ...testimonial, client_name: event.target.value };
                        setTestimonials(next);
                      }} />
                      <Input placeholder="Title" value={testimonial.client_title ?? ''} onChange={(event) => {
                        const next = [...testimonials];
                        next[index] = { ...testimonial, client_title: event.target.value };
                        setTestimonials(next);
                      }} />
                    </div>
                    <Textarea placeholder="Quote" value={testimonial.content} onChange={(event) => {
                      const next = [...testimonials];
                      next[index] = { ...testimonial, content: event.target.value };
                      setTestimonials(next);
                    }} />
                    <div className="grid sm:grid-cols-[1fr_100px_auto] gap-3 items-center">
                      <Input placeholder="Optional photo URL" value={testimonial.image_url ?? ''} onChange={(event) => {
                        const next = [...testimonials];
                        next[index] = { ...testimonial, image_url: event.target.value };
                        setTestimonials(next);
                      }} />
                      <Input type="number" min={1} max={5} value={testimonial.rating} onChange={(event) => {
                        const next = [...testimonials];
                        next[index] = { ...testimonial, rating: Number(event.target.value) };
                        setTestimonials(next);
                      }} />
                      <div className="flex items-center gap-2"><Switch checked={testimonial.is_featured} onCheckedChange={(checked) => {
                        const next = [...testimonials];
                        next[index] = { ...testimonial, is_featured: checked };
                        setTestimonials(next);
                      }} /><span className="text-sm">Featured</span></div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => saveTestimonial(testimonial, index)} disabled={saving === `testimonial-${index}`}>
                        <Save className="h-4 w-4 mr-2" /> Save
                      </Button>
                      {testimonial.id && <Button size="sm" variant="outline" onClick={() => deleteTestimonial(testimonial.id)}><Trash2 className="h-4 w-4" /></Button>}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="about">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About Page</CardTitle>
                <CardDescription>Hero, story, mission, vision, team intro, and call-to-action copy.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <FieldGroup label="Hero title">
                    <Input value={about.hero.title} onChange={(event) => setContent({ ...content, about: { ...about, hero: { ...about.hero, title: event.target.value } } })} />
                  </FieldGroup>
                  <FieldGroup label="Hero subtitle">
                    <Textarea rows={2} value={about.hero.subtitle} onChange={(event) => setContent({ ...content, about: { ...about, hero: { ...about.hero, subtitle: event.target.value } } })} />
                  </FieldGroup>
                </div>
                <FieldGroup label="Hero image URL">
                  <div className="flex gap-2">
                    <Input value={about.hero.imageUrl} onChange={(event) => setContent({ ...content, about: { ...about, hero: { ...about.hero, imageUrl: event.target.value } } })} />
                    <Button variant="outline" size="icon" asChild>
                      <label>
                        <Upload className="h-4 w-4" />
                        <Input className="hidden" type="file" accept="image/*" onChange={(event) => uploadAndSet(event.target.files?.[0], 'about', (url) => ({ ...content, about: { ...about, hero: { ...about.hero, imageUrl: url } } }), 'About hero')} />
                      </label>
                    </Button>
                  </div>
                </FieldGroup>
                <div className="overflow-hidden rounded-lg border bg-neutral-950">
                  <div className="relative aspect-[16/6]">
                    <Image src={about.hero.imageUrl} alt="About hero preview" fill className="object-cover" sizes="720px" />
                    <div className="absolute inset-0 bg-black/50" />
                    <div className="absolute inset-0 flex items-center justify-center px-5 text-center text-white">
                      <div>
                        <p className="font-[family-name:var(--font-playfair)] text-3xl font-bold">{about.hero.title}</p>
                        <p className="mt-2 text-sm text-white/80">{about.hero.subtitle}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <FieldGroup label="Story title">
                    <Input value={about.story.title} onChange={(event) => setContent({ ...content, about: { ...about, story: { ...about.story, title: event.target.value } } })} />
                  </FieldGroup>
                  <FieldGroup label="Story image URL">
                    <div className="flex gap-2">
                      <Input value={about.story.imageUrl} onChange={(event) => setContent({ ...content, about: { ...about, story: { ...about.story, imageUrl: event.target.value } } })} />
                      <Button variant="outline" size="icon" asChild>
                        <label>
                          <Upload className="h-4 w-4" />
                          <Input className="hidden" type="file" accept="image/*" onChange={(event) => uploadAndSet(event.target.files?.[0], 'about', (url) => ({ ...content, about: { ...about, story: { ...about.story, imageUrl: url } } }), 'About story')} />
                        </label>
                      </Button>
                    </div>
                  </FieldGroup>
                </div>
                <FieldGroup label="Story paragraphs">
                  <StringListEditor values={about.story.paragraphs} onChange={(paragraphs) => setContent({ ...content, about: { ...about, story: { ...about.story, paragraphs } } })} />
                </FieldGroup>
                <FieldGroup label="Story values">
                  <div className="space-y-2">
                    {about.story.values.map((value, index) => (
                      <div key={index} className="grid gap-2 sm:grid-cols-[1fr_2fr_auto]">
                        <Input placeholder="Icon name" value={value.icon} onChange={(event) => {
                          const values = [...about.story.values];
                          values[index] = { ...value, icon: event.target.value };
                          setContent({ ...content, about: { ...about, story: { ...about.story, values } } });
                        }} />
                        <Input placeholder="Label" value={value.label} onChange={(event) => {
                          const values = [...about.story.values];
                          values[index] = { ...value, label: event.target.value };
                          setContent({ ...content, about: { ...about, story: { ...about.story, values } } });
                        }} />
                        <Button type="button" variant="outline" size="icon" onClick={() => {
                          const values = about.story.values.filter((_, i) => i !== index);
                          setContent({ ...content, about: { ...about, story: { ...about.story, values } } });
                        }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => setContent({ ...content, about: { ...about, story: { ...about.story, values: [...about.story.values, { icon: 'Heart', label: '' }] } } })}>
                      <Plus className="h-4 w-4 mr-2" /> Add value
                    </Button>
                  </div>
                </FieldGroup>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="space-y-4 rounded-lg border p-4">
                    <FieldGroup label="Mission title">
                      <Input value={about.mission.title} onChange={(event) => setContent({ ...content, about: { ...about, mission: { ...about.mission, title: event.target.value } } })} />
                    </FieldGroup>
                    <FieldGroup label="Mission content">
                      <Textarea rows={4} value={about.mission.content} onChange={(event) => setContent({ ...content, about: { ...about, mission: { ...about.mission, content: event.target.value } } })} />
                    </FieldGroup>
                  </div>
                  <div className="space-y-4 rounded-lg border p-4">
                    <FieldGroup label="Vision title">
                      <Input value={about.vision.title} onChange={(event) => setContent({ ...content, about: { ...about, vision: { ...about.vision, title: event.target.value } } })} />
                    </FieldGroup>
                    <FieldGroup label="Vision content">
                      <Textarea rows={4} value={about.vision.content} onChange={(event) => setContent({ ...content, about: { ...about, vision: { ...about.vision, content: event.target.value } } })} />
                    </FieldGroup>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <FieldGroup label="Team section title">
                    <Input value={about.teamSection.title} onChange={(event) => setContent({ ...content, about: { ...about, teamSection: { ...about.teamSection, title: event.target.value } } })} />
                  </FieldGroup>
                  <FieldGroup label="Team section subtitle">
                    <Input value={about.teamSection.subtitle} onChange={(event) => setContent({ ...content, about: { ...about, teamSection: { ...about.teamSection, subtitle: event.target.value } } })} />
                  </FieldGroup>
                  <FieldGroup label="CTA title">
                    <Input value={about.cta.title} onChange={(event) => setContent({ ...content, about: { ...about, cta: { ...about.cta, title: event.target.value } } })} />
                  </FieldGroup>
                  <FieldGroup label="CTA subtitle">
                    <Input value={about.cta.subtitle} onChange={(event) => setContent({ ...content, about: { ...about, cta: { ...about.cta, subtitle: event.target.value } } })} />
                  </FieldGroup>
                </div>

                <Button onClick={() => saveContent('about', 'About page')} disabled={saving === 'about'}>
                  {saving === 'about' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save about page
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="team">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>Add, edit, reorder, and hide public team profiles.</CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => setTeamMembers([
                  {
                    id: '',
                    name: '',
                    role: '',
                    bio: '',
                    image_url: '',
                    photo_url: '',
                    social_links: { instagram: '', tiktok: '' },
                    sort_order: teamMembers.length + 1,
                    is_active: true,
                    created_at: '',
                  },
                  ...teamMembers,
                ])}
              >
                <Plus className="h-4 w-4 mr-2" /> Add
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {teamMembers.map((member, index) => (
                <div key={member.id || `team-${index}`} className="rounded-lg border p-4 space-y-4">
                  <div className="grid gap-4 lg:grid-cols-[160px_1fr]">
                    <div className="space-y-3">
                      <div className="relative aspect-[4/5] overflow-hidden rounded-md border bg-muted">
                        {member.photo_url || member.image_url ? (
                          <Image
                            src={member.photo_url || member.image_url || ''}
                            alt={`${member.name || 'Team member'} preview`}
                            fill
                            className="object-cover"
                            sizes="160px"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-muted-foreground">
                            <Camera className="h-8 w-8" />
                          </div>
                        )}
                      </div>
                      <Button variant="outline" size="sm" className="w-full" asChild>
                        <label>
                          <Upload className="h-4 w-4 mr-2" /> Upload photo
                          <Input
                            className="hidden"
                            type="file"
                            accept="image/*"
                            onChange={async (event) => {
                              const file = event.target.files?.[0];
                              if (!file) return;
                              setSaving(`team-photo-${index}`);
                              try {
                                const url = await uploadWebsiteAsset(file, 'team');
                                const next = [...teamMembers];
                                next[index] = { ...member, photo_url: url, image_url: url };
                                setTeamMembers(next);
                                toast({ title: 'Photo uploaded', description: 'Save the team member to make this photo live.' });
                              } catch (error) {
                                toast({
                                  title: 'Upload failed',
                                  description: error instanceof Error ? error.message : 'Unable to upload photo.',
                                  variant: 'destructive',
                                });
                              } finally {
                                setSaving(null);
                              }
                            }}
                          />
                        </label>
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <FieldGroup label="Name">
                          <Input value={member.name} onChange={(event) => {
                            const next = [...teamMembers];
                            next[index] = { ...member, name: event.target.value };
                            setTeamMembers(next);
                          }} />
                        </FieldGroup>
                        <FieldGroup label="Role">
                          <Input value={member.role} onChange={(event) => {
                            const next = [...teamMembers];
                            next[index] = { ...member, role: event.target.value };
                            setTeamMembers(next);
                          }} />
                        </FieldGroup>
                      </div>
                      <FieldGroup label="Short bio">
                        <Textarea rows={3} value={member.bio ?? ''} onChange={(event) => {
                          const next = [...teamMembers];
                          next[index] = { ...member, bio: event.target.value };
                          setTeamMembers(next);
                        }} />
                      </FieldGroup>
                      <FieldGroup label="Photo URL">
                        <Input value={member.photo_url || member.image_url || ''} onChange={(event) => {
                          const next = [...teamMembers];
                          next[index] = { ...member, photo_url: event.target.value, image_url: event.target.value };
                          setTeamMembers(next);
                        }} />
                      </FieldGroup>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <FieldGroup label="Instagram">
                          <Input value={member.social_links?.instagram ?? ''} onChange={(event) => {
                            const next = [...teamMembers];
                            next[index] = {
                              ...member,
                              social_links: { ...member.social_links, instagram: event.target.value },
                            };
                            setTeamMembers(next);
                          }} />
                        </FieldGroup>
                        <FieldGroup label="TikTok">
                          <Input value={member.social_links?.tiktok ?? ''} onChange={(event) => {
                            const next = [...teamMembers];
                            next[index] = {
                              ...member,
                              social_links: { ...member.social_links, tiktok: event.target.value },
                            };
                            setTeamMembers(next);
                          }} />
                        </FieldGroup>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <FieldGroup label="Display order">
                          <Input className="w-28" type="number" value={member.sort_order} onChange={(event) => {
                            const next = [...teamMembers];
                            next[index] = { ...member, sort_order: Number(event.target.value) || 0 };
                            setTeamMembers(next);
                          }} />
                        </FieldGroup>
                        <div className="flex items-center gap-2 pt-7">
                          <Switch checked={member.is_active} onCheckedChange={(checked) => {
                            const next = [...teamMembers];
                            next[index] = { ...member, is_active: checked };
                            setTeamMembers(next);
                          }} />
                          <span className="text-sm">Active</span>
                        </div>
                        <div className="ml-auto flex gap-2 pt-7">
                          <Button type="button" size="icon" variant="outline" onClick={() => moveTeamMember(index, -1)} disabled={index === 0 || saving === 'team-order'}>
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button type="button" size="icon" variant="outline" onClick={() => moveTeamMember(index, 1)} disabled={index === teamMembers.length - 1 || saving === 'team-order'}>
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                          <Button size="sm" onClick={() => saveTeamMember(member, index)} disabled={saving === `team-${index}`}>
                            <Save className="h-4 w-4 mr-2" /> Save
                          </Button>
                          {member.id && (
                            <Button size="sm" variant="outline" onClick={() => deleteTeamMember(member.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {teamMembers.length === 0 && (
                <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                  No team members yet. Add the first profile to publish it on the Team page.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Services Page</CardTitle>
                <CardDescription>Hero copy, banner image, process steps, service categories, and service cards.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <FieldGroup label="Hero badge">
                    <Input value={content.services.hero.badge} onChange={(event) => setContent({ ...content, services: { ...content.services, hero: { ...content.services.hero, badge: event.target.value } } })} />
                  </FieldGroup>
                  <FieldGroup label="Hero title">
                    <Input value={content.services.hero.title} onChange={(event) => setContent({ ...content, services: { ...content.services, hero: { ...content.services.hero, title: event.target.value } } })} />
                  </FieldGroup>
                </div>
                <FieldGroup label="Hero subtitle">
                  <Textarea rows={2} value={content.services.hero.subtitle} onChange={(event) => setContent({ ...content, services: { ...content.services, hero: { ...content.services.hero, subtitle: event.target.value } } })} />
                </FieldGroup>
                <FieldGroup label="Hero image URL">
                  <div className="flex gap-2">
                    <Input value={content.services.hero.imageUrl} onChange={(event) => setContent({ ...content, services: { ...content.services, hero: { ...content.services.hero, imageUrl: event.target.value } } })} />
                    <Button variant="outline" size="icon" asChild>
                      <label>
                        <Upload className="h-4 w-4" />
                        <Input className="hidden" type="file" accept="image/*" onChange={(event) => uploadAndSet(event.target.files?.[0], 'services', (url) => ({ ...content, services: { ...content.services, hero: { ...content.services.hero, imageUrl: url } } }), 'Services')} />
                      </label>
                    </Button>
                  </div>
                </FieldGroup>
                <div className="overflow-hidden rounded-lg border bg-neutral-950">
                  <div className="relative aspect-[16/6]">
                    <Image src={content.services.hero.imageUrl} alt="Services hero preview" fill className="object-cover" sizes="720px" />
                    <div className="absolute inset-0 bg-black/55" />
                    <div className="absolute inset-0 flex items-center justify-center px-5 text-center text-white">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/80">{content.services.hero.badge}</p>
                        <p className="mt-2 font-[family-name:var(--font-playfair)] text-3xl font-bold">{content.services.hero.title}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <FieldGroup label="Process title">
                    <Input value={content.services.howItWorks.title} onChange={(event) => setContent({ ...content, services: { ...content.services, howItWorks: { ...content.services.howItWorks, title: event.target.value } } })} />
                  </FieldGroup>
                  <FieldGroup label="Process subtitle">
                    <Input value={content.services.howItWorks.subtitle} onChange={(event) => setContent({ ...content, services: { ...content.services, howItWorks: { ...content.services.howItWorks, subtitle: event.target.value } } })} />
                  </FieldGroup>
                </div>
                <div className="space-y-3">
                  <Label>Process steps</Label>
                  {content.services.howItWorks.steps.map((step, index) => (
                    <div key={index} className="grid gap-3 rounded-lg border p-3 sm:grid-cols-[70px_1fr_2fr]">
                      <Input value={step.step} onChange={(event) => {
                        const steps = [...content.services.howItWorks.steps];
                        steps[index] = { ...step, step: event.target.value };
                        setContent({ ...content, services: { ...content.services, howItWorks: { ...content.services.howItWorks, steps } } });
                      }} />
                      <Input value={step.title} onChange={(event) => {
                        const steps = [...content.services.howItWorks.steps];
                        steps[index] = { ...step, title: event.target.value };
                        setContent({ ...content, services: { ...content.services, howItWorks: { ...content.services.howItWorks, steps } } });
                      }} />
                      <Input value={step.description} onChange={(event) => {
                        const steps = [...content.services.howItWorks.steps];
                        steps[index] = { ...step, description: event.target.value };
                        setContent({ ...content, services: { ...content.services, howItWorks: { ...content.services.howItWorks, steps } } });
                      }} />
                    </div>
                  ))}
                </div>
                <Button onClick={() => saveContent('services', 'Services page')}><Save className="h-4 w-4 mr-2" /> Save services page</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Service Categories</CardTitle>
                  <CardDescription>These power the filter buttons and homepage service tiles.</CardDescription>
                </div>
                <Button size="sm" onClick={() => setCategories([...categories, { id: '', name: '', slug: '', description: '', image_url: '', sort_order: categories.length + 1, created_at: '' }])}>
                  <Plus className="h-4 w-4 mr-2" /> Add
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {categories.map((category, index) => (
                  <div key={category.id || `category-${index}`} className="rounded-lg border p-4 space-y-4">
                    <div className="grid gap-3 lg:grid-cols-[1fr_120px_auto]">
                      <FieldGroup label="Category name">
                        <Input placeholder="Weddings" value={category.name} onChange={(event) => {
                          const next = [...categories];
                          next[index] = { ...category, name: event.target.value };
                          setCategories(next);
                        }} />
                      </FieldGroup>
                      <FieldGroup label="Display order">
                        <Input type="number" value={category.sort_order} onChange={(event) => {
                          const next = [...categories];
                          next[index] = { ...category, sort_order: Number(event.target.value) || 0 };
                          setCategories(next);
                        }} />
                      </FieldGroup>
                      <div className="flex items-end gap-2">
                        <Button size="sm" onClick={() => saveCategory(category, index)} disabled={saving === `category-${index}`}><Save className="h-4 w-4" /></Button>
                        {category.id && <Button size="sm" variant="outline" onClick={() => deleteCategory(category.id)}><Trash2 className="h-4 w-4" /></Button>}
                      </div>
                    </div>
                    <FieldGroup label="Hero image URL" hint="Used as this category's homepage service tile image.">
                      <div className="flex gap-2">
                        <Input placeholder="https://..." value={category.image_url ?? ''} onChange={(event) => {
                          const next = [...categories];
                          next[index] = { ...category, image_url: event.target.value };
                          setCategories(next);
                        }} />
                        <Button variant="outline" size="icon" asChild>
                          <label>
                            <Upload className="h-4 w-4" />
                            <Input
                              className="hidden"
                              type="file"
                              accept="image/*"
                              onChange={async (event) => {
                                const file = event.target.files?.[0];
                                if (!file) return;
                                setSaving(`category-image-${index}`);
                                try {
                                  const url = await uploadWebsiteAsset(file, 'service-categories');
                                  const next = [...categories];
                                  next[index] = { ...category, image_url: url };
                                  setCategories(next);
                                  toast({ title: 'Image uploaded', description: 'Save the category to make this image live.' });
                                } catch (error) {
                                  toast({
                                    title: 'Upload failed',
                                    description: error instanceof Error ? error.message : 'Unable to upload image.',
                                    variant: 'destructive',
                                  });
                                } finally {
                                  setSaving(null);
                                }
                              }}
                            />
                          </label>
                        </Button>
                      </div>
                    </FieldGroup>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <FieldGroup label="Homepage image fit" hint="Use Fill for photography crops, or Show full image for poster-style uploads.">
                        <Select
                          value={getCategoryImageAdjustment(category.id).imageFit}
                          onValueChange={(imageFit) =>
                            updateCategoryImageAdjustment(category.id, {
                              imageFit: imageFit as ReturnType<typeof defaultImageAdjustment>['imageFit'],
                            })
                          }
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {heroImageFitOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FieldGroup>
                      <FieldGroup label="Homepage image position" hint="Controls which part stays visible when Fill crops.">
                        <Select
                          value={getCategoryImageAdjustment(category.id).imagePosition}
                          onValueChange={(imagePosition) =>
                            updateCategoryImageAdjustment(category.id, {
                              imagePosition: imagePosition as ReturnType<typeof defaultImageAdjustment>['imagePosition'],
                            })
                          }
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {heroImagePositionOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FieldGroup>
                    </div>
                    {category.image_url && (
                      <div className="relative aspect-[16/7] overflow-hidden rounded-md border bg-muted">
                        <Image
                          src={category.image_url}
                          alt={`${category.name || 'Service category'} hero preview`}
                          fill
                          style={{
                            objectFit: getCategoryImageAdjustment(category.id).imageFit,
                            objectPosition: getCategoryImageAdjustment(category.id).imagePosition,
                          }}
                          sizes="720px"
                        />
                      </div>
                    )}
                    {category.id && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => saveSettings('Service category image')}
                      >
                        <Save className="h-4 w-4 mr-2" /> Save image fit
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Service Cards</CardTitle>
                  <CardDescription>Edit the services customers see on the Services page.</CardDescription>
                </div>
                <Button size="sm" onClick={() => setServices([...services, { id: '', category_id: categories[0]?.id ?? null, name: '', description: '', features: [], starting_price: null, image_url: '', sort_order: services.length + 1, created_at: '' }])}>
                  <Plus className="h-4 w-4 mr-2" /> Add
                </Button>
              </CardHeader>
              <CardContent className="space-y-5">
                {services.map((service, index) => (
                  <div key={service.id || `service-${index}`} className="rounded-lg border p-4 space-y-4">
                    <div className="grid gap-4 lg:grid-cols-2">
                      <FieldGroup label="Service name">
                        <Input value={service.name} onChange={(event) => {
                          const next = [...services];
                          next[index] = { ...service, name: event.target.value };
                          setServices(next);
                        }} />
                      </FieldGroup>
                      <FieldGroup label="Category">
                        <Select value={service.category_id ?? 'none'} onValueChange={(category_id) => {
                          const next = [...services];
                          next[index] = { ...service, category_id: category_id === 'none' ? null : category_id };
                          setServices(next);
                        }}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No category</SelectItem>
                            {categories.filter((category) => category.id).map((category) => (
                              <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FieldGroup>
                      <FieldGroup label="Starting price">
                        <Input type="number" min={0} value={service.starting_price ?? ''} onChange={(event) => {
                          const next = [...services];
                          next[index] = { ...service, starting_price: event.target.value === '' ? null : Number(event.target.value) };
                          setServices(next);
                        }} />
                      </FieldGroup>
                      <FieldGroup label="Display order">
                        <Input type="number" value={service.sort_order} onChange={(event) => {
                          const next = [...services];
                          next[index] = { ...service, sort_order: Number(event.target.value) || 0 };
                          setServices(next);
                        }} />
                      </FieldGroup>
                    </div>
                    <FieldGroup label="Description">
                      <Textarea rows={2} value={service.description ?? ''} onChange={(event) => {
                        const next = [...services];
                        next[index] = { ...service, description: event.target.value };
                        setServices(next);
                      }} />
                    </FieldGroup>
                    <FieldGroup label="Image URL">
                      <Input value={service.image_url ?? ''} onChange={(event) => {
                        const next = [...services];
                        next[index] = { ...service, image_url: event.target.value };
                        setServices(next);
                      }} />
                    </FieldGroup>
                    <FieldGroup label="Features">
                      <StringListEditor values={service.features ?? []} placeholder="Professionally edited photos" onChange={(features) => {
                        const next = [...services];
                        next[index] = { ...service, features };
                        setServices(next);
                      }} />
                    </FieldGroup>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => saveService(service, index)} disabled={saving === `service-${index}`}><Save className="h-4 w-4 mr-2" /> Save service</Button>
                      {service.id && <Button size="sm" variant="outline" onClick={() => deleteService(service.id)}><Trash2 className="h-4 w-4" /></Button>}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="business">
          <Card>
            <CardHeader><CardTitle>Business Info</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <FieldGroup label="Phone numbers"><StringListEditor values={business.phones} placeholder="0705 500291" onChange={(phones) => setContent({ ...content, business: { ...business, phones } })} /></FieldGroup>
                <FieldGroup label="Email addresses"><StringListEditor values={business.emails} placeholder="hello@rubshoots.com" onChange={(emails) => setContent({ ...content, business: { ...business, emails } })} /></FieldGroup>
                <FieldGroup label="Address line 1"><Input value={business.addressLine1} onChange={(event) => setContent({ ...content, business: { ...business, addressLine1: event.target.value } })} /></FieldGroup>
                <FieldGroup label="Address line 2"><Input value={business.addressLine2} onChange={(event) => setContent({ ...content, business: { ...business, addressLine2: event.target.value } })} /></FieldGroup>
                <FieldGroup label="City"><Input value={business.city} onChange={(event) => setContent({ ...content, business: { ...business, city: event.target.value } })} /></FieldGroup>
                <FieldGroup label="Country"><Input value={business.country} onChange={(event) => setContent({ ...content, business: { ...business, country: event.target.value } })} /></FieldGroup>
                <FieldGroup label="Weekday hours"><Input value={business.hoursWeekday} onChange={(event) => setContent({ ...content, business: { ...business, hoursWeekday: event.target.value } })} /></FieldGroup>
                <FieldGroup label="Weekend hours"><Input value={business.hoursWeekend} onChange={(event) => setContent({ ...content, business: { ...business, hoursWeekend: event.target.value } })} /></FieldGroup>
              </div>
              <FieldGroup label="Map display address"><Input value={business.mapAddress} onChange={(event) => setContent({ ...content, business: { ...business, mapAddress: event.target.value } })} /></FieldGroup>
              <div className="grid sm:grid-cols-3 gap-4">
                <FieldGroup label="Instagram"><Input value={business.social.instagram} onChange={(event) => setContent({ ...content, business: { ...business, social: { ...business.social, instagram: event.target.value } } })} /></FieldGroup>
                <FieldGroup label="TikTok"><Input value={business.social.twitter} onChange={(event) => setContent({ ...content, business: { ...business, social: { ...business.social, twitter: event.target.value } } })} /></FieldGroup>
                <FieldGroup label="WhatsApp"><Input value={business.social.facebook} onChange={(event) => setContent({ ...content, business: { ...business, social: { ...business.social, facebook: event.target.value } } })} /></FieldGroup>
              </div>
              <Button onClick={() => saveContent('business', 'Business info')}><Save className="h-4 w-4 mr-2" /> Save business info</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo">
          <Card>
            <CardHeader><CardTitle>SEO & Metadata</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <FieldGroup label="Site title"><Input value={settings.seo.siteTitle} onChange={(event) => setSettings({ ...settings, seo: { ...settings.seo, siteTitle: event.target.value } })} /></FieldGroup>
              <FieldGroup label="Meta description"><Textarea rows={2} value={settings.seo.metaDescription} onChange={(event) => setSettings({ ...settings, seo: { ...settings.seo, metaDescription: event.target.value } })} /></FieldGroup>
              <FieldGroup label="Open Graph image"><Input value={settings.seo.openGraphImage} onChange={(event) => setSettings({ ...settings, seo: { ...settings.seo, openGraphImage: event.target.value } })} /></FieldGroup>
              <Button onClick={() => saveSettings('SEO')}><Save className="h-4 w-4 mr-2" /> Save SEO</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="toggles">
          <Card>
            <CardHeader>
              <CardTitle>Feature Toggles</CardTitle>
              <CardDescription>Only toggles for features that already exist in the app are included.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(settings.featureToggles).map(([key, checked]) => (
                <div key={key} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">{key.replace(/([A-Z])/g, ' $1')}</p>
                    <p className="text-sm text-muted-foreground">Enable or disable this public-site behavior.</p>
                  </div>
                  <Switch checked={checked} onCheckedChange={(value) => setSettings({ ...settings, featureToggles: { ...settings.featureToggles, [key]: value } })} />
                </div>
              ))}
              <div className="rounded-lg border p-4 space-y-3">
                <div>
                  <p className="font-medium">Default gallery link expiry</p>
                  <p className="text-sm text-muted-foreground">
                    Number of days before client gallery links expire when no specific expiry date is set on the event.
                    Use 0 to leave links open until an admin sets a date.
                  </p>
                </div>
                <Input
                  type="number"
                  min={0}
                  max={3650}
                  value={settings.galleryAccess?.defaultLinkExpiryDays ?? 0}
                  onChange={(event) =>
                    setSettings({
                      ...settings,
                      galleryAccess: {
                        ...settings.galleryAccess,
                        defaultLinkExpiryDays: Math.max(0, Number(event.target.value) || 0),
                      },
                    })
                  }
                />
              </div>
              <Button onClick={() => saveSettings('Feature toggle')}><Save className="h-4 w-4 mr-2" /> Save toggles</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="watermarking">
          <Card>
            <CardHeader>
              <CardTitle>Watermarking</CardTitle>
              <CardDescription>The photos table includes `watermarked_url`; these settings control the public preference.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">Show watermarked previews by default</p>
                  <p className="text-sm text-muted-foreground">Uses `watermarked_url` where the gallery has one available.</p>
                </div>
                <Switch checked={settings.watermarking.enabled} onCheckedChange={(enabled) => setSettings({ ...settings, watermarking: { ...settings.watermarking, enabled }, featureToggles: { ...settings.featureToggles, watermarkedPreviews: enabled } })} />
              </div>
              <FieldGroup label="Watermark text"><Input value={settings.watermarking.text} onChange={(event) => setSettings({ ...settings, watermarking: { ...settings.watermarking, text: event.target.value } })} /></FieldGroup>
              <FieldGroup label="Watermark logo URL"><Input value={settings.watermarking.logoUrl} onChange={(event) => setSettings({ ...settings, watermarking: { ...settings.watermarking, logoUrl: event.target.value } })} /></FieldGroup>
              <Button onClick={() => saveSettings('Watermarking')}><ImageIcon className="h-4 w-4 mr-2" /> Save watermarking</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
