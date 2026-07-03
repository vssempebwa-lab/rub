'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Loader2, Plus, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useRequireAdmin } from '@/features/auth/hooks/use-require-admin';
import { defaultSiteContent } from '@/features/website/defaults';
import {
  fetchAllSiteContent,
  fetchAllSiteFaqs,
  fetchAllTeamMembers,
  saveSiteContent,
} from '@/features/website/api/site-content';
import type { SiteContentMap, SiteFaq, TeamMember } from '@/features/website/types';
import { PricingPackagesEditor } from '@/features/website/components/pricing-packages-editor';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

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
  return (
    <div className="space-y-2">
      {values.map((value, index) => (
        <div key={index} className="flex gap-2">
          <Input
            value={value}
            placeholder={placeholder}
            onChange={(e) => {
              const next = [...values];
              next[index] = e.target.value;
              onChange(next);
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => onChange(values.filter((_, i) => i !== index))}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...values, ''])}>
        <Plus className="h-4 w-4 mr-2" /> Add line
      </Button>
    </div>
  );
}

export function WebsiteManager() {
  const { loading: authLoading, isAdmin } = useRequireAdmin();
  const [content, setContent] = useState<SiteContentMap>(defaultSiteContent);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [faqs, setFaqs] = useState<SiteFaq[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) loadAll();
  }, [isAdmin]);

  async function loadAll() {
    setLoading(true);
    const [siteContent, teamMembers, siteFaqs, { data: testimonialData }] = await Promise.all([
      fetchAllSiteContent(),
      fetchAllTeamMembers(),
      fetchAllSiteFaqs(),
      supabase.from('testimonials').select('*').order('created_at', { ascending: false }),
    ]);
    setContent(siteContent);
    setTeam(teamMembers);
    setFaqs(siteFaqs);
    setTestimonials(testimonialData ?? []);
    setLoading(false);
  }

  async function saveKey<K extends keyof SiteContentMap>(key: K) {
    setSaving(key);
    const { error } = await saveSiteContent(key, content[key]);
    setSaving(null);
    if (error) {
      toast({ title: 'Save failed', description: error, variant: 'destructive' });
    } else {
      toast({ title: 'Saved', description: `${key} content updated on your public website.` });
    }
  }

  async function saveTeamMember(member: Partial<TeamMember> & { name: string; role: string }) {
    const payload = {
      name: member.name,
      role: member.role,
      image_url: member.image_url || null,
      bio: member.bio || null,
      sort_order: member.sort_order ?? 0,
      is_active: member.is_active ?? true,
    };
    if (member.id) {
      const { error } = await supabase.from('team_members').update(payload).eq('id', member.id);
      if (error) return toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      const { error } = await supabase.from('team_members').insert([payload]);
      if (error) return toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
    toast({ title: 'Team member saved' });
    loadAll();
  }

  async function deleteTeamMember(id: string) {
    const { error } = await supabase.from('team_members').delete().eq('id', id);
    if (error) return toast({ title: 'Error', description: error.message, variant: 'destructive' });
    toast({ title: 'Team member removed' });
    loadAll();
  }

  async function saveFaq(faq: Partial<SiteFaq> & { question: string; answer: string }) {
    if (faq.id) {
      const { error } = await supabase.from('site_faqs').update(faq).eq('id', faq.id);
      if (error) return toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      const { error } = await supabase.from('site_faqs').insert([{ ...faq, page: 'pricing', sort_order: faqs.length + 1 }]);
      if (error) return toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
    toast({ title: 'FAQ saved' });
    loadAll();
  }

  async function deleteFaq(id: string) {
    const { error } = await supabase.from('site_faqs').delete().eq('id', id);
    if (error) return toast({ title: 'Error', description: error.message, variant: 'destructive' });
    toast({ title: 'FAQ removed' });
    loadAll();
  }

  async function saveTestimonial(t: any) {
    const payload = {
      client_name: t.client_name,
      client_title: t.client_title || null,
      content: t.content,
      rating: Number(t.rating) || 5,
      is_featured: !!t.is_featured,
      image_url: t.image_url || null,
    };
    if (t.id) {
      const { error } = await supabase.from('testimonials').update(payload).eq('id', t.id);
      if (error) return toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      const { error } = await supabase.from('testimonials').insert([payload]);
      if (error) return toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
    toast({ title: 'Testimonial saved' });
    loadAll();
  }

  async function deleteTestimonial(id: string) {
    const { error } = await supabase.from('testimonials').delete().eq('id', id);
    if (error) return toast({ title: 'Error', description: error.message, variant: 'destructive' });
    toast({ title: 'Testimonial removed' });
    loadAll();
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const business = content.business;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Website Manager</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Edit your public website content. Changes appear on the live site after you save each section.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/" target="_blank">
            View public site <ExternalLink className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="business" className="space-y-6">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="home">Homepage</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio & Pricing</TabsTrigger>
          <TabsTrigger value="packages">Packages</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="faqs">FAQs</TabsTrigger>
          <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
        </TabsList>

        <TabsContent value="business">
          <Card>
            <CardHeader>
              <CardTitle>Business & branding</CardTitle>
              <CardDescription>Contact details, footer, SEO, and social links used across the site.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <FieldGroup label="Business name">
                  <Input value={business.businessName} onChange={(e) => setContent({ ...content, business: { ...business, businessName: e.target.value } })} />
                </FieldGroup>
                <FieldGroup label="Tagline">
                  <Input value={business.tagline} onChange={(e) => setContent({ ...content, business: { ...business, tagline: e.target.value } })} />
                </FieldGroup>
              </div>
              <FieldGroup label="Footer description">
                <Textarea rows={3} value={business.footerDescription} onChange={(e) => setContent({ ...content, business: { ...business, footerDescription: e.target.value } })} />
              </FieldGroup>
              <FieldGroup label="Footer copyright" hint="Appears after '© 2026' in the footer. E.g. 'Rub Shoots Photography. All rights reserved.'">
                <Input value={business.footerCopyright ?? ''} onChange={(e) => setContent({ ...content, business: { ...business, footerCopyright: e.target.value } })} />
              </FieldGroup>
              <div className="grid sm:grid-cols-2 gap-6">
                <FieldGroup label="Phone numbers">
                  <StringListEditor values={business.phones} onChange={(phones) => setContent({ ...content, business: { ...business, phones } })} placeholder="+256..." />
                </FieldGroup>
                <FieldGroup label="Email addresses">
                  <StringListEditor values={business.emails} onChange={(emails) => setContent({ ...content, business: { ...business, emails } })} placeholder="hello@..." />
                </FieldGroup>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <FieldGroup label="Address line 1"><Input value={business.addressLine1} onChange={(e) => setContent({ ...content, business: { ...business, addressLine1: e.target.value } })} /></FieldGroup>
                <FieldGroup label="Address line 2"><Input value={business.addressLine2} onChange={(e) => setContent({ ...content, business: { ...business, addressLine2: e.target.value } })} /></FieldGroup>
                <FieldGroup label="City"><Input value={business.city} onChange={(e) => setContent({ ...content, business: { ...business, city: e.target.value } })} /></FieldGroup>
                <FieldGroup label="Country"><Input value={business.country} onChange={(e) => setContent({ ...content, business: { ...business, country: e.target.value } })} /></FieldGroup>
              </div>
              <FieldGroup label="Map display address">
                <Input value={business.mapAddress} onChange={(e) => setContent({ ...content, business: { ...business, mapAddress: e.target.value } })} />
              </FieldGroup>
              <div className="grid sm:grid-cols-2 gap-4">
                <FieldGroup label="Weekday hours"><Input value={business.hoursWeekday} onChange={(e) => setContent({ ...content, business: { ...business, hoursWeekday: e.target.value } })} /></FieldGroup>
                <FieldGroup label="Weekend hours"><Input value={business.hoursWeekend} onChange={(e) => setContent({ ...content, business: { ...business, hoursWeekend: e.target.value } })} /></FieldGroup>
                <FieldGroup label="Footer hours summary"><Input value={business.footerHours} onChange={(e) => setContent({ ...content, business: { ...business, footerHours: e.target.value } })} /></FieldGroup>
                <FieldGroup label="Currency code"><Input value={business.currencyCode} onChange={(e) => setContent({ ...content, business: { ...business, currencyCode: e.target.value } })} /></FieldGroup>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <FieldGroup label="Instagram URL"><Input value={business.social.instagram} onChange={(e) => setContent({ ...content, business: { ...business, social: { ...business.social, instagram: e.target.value } } })} /></FieldGroup>
                <FieldGroup label="Facebook URL"><Input value={business.social.facebook} onChange={(e) => setContent({ ...content, business: { ...business, social: { ...business.social, facebook: e.target.value } } })} /></FieldGroup>
                <FieldGroup label="Twitter URL"><Input value={business.social.twitter} onChange={(e) => setContent({ ...content, business: { ...business, social: { ...business.social, twitter: e.target.value } } })} /></FieldGroup>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <FieldGroup label="SEO title"><Input value={business.seoTitle} onChange={(e) => setContent({ ...content, business: { ...business, seoTitle: e.target.value } })} /></FieldGroup>
                <FieldGroup label="SEO description"><Textarea rows={2} value={business.seoDescription} onChange={(e) => setContent({ ...content, business: { ...business, seoDescription: e.target.value } })} /></FieldGroup>
              </div>
              <Button onClick={() => saveKey('business')} disabled={saving === 'business'}>
                {saving === 'business' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save business settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="home">
          <Card>
            <CardHeader><CardTitle>Homepage</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <FieldGroup label="Hero badge"><Input value={content.home.hero.badge} onChange={(e) => setContent({ ...content, home: { ...content.home, hero: { ...content.home.hero, badge: e.target.value } } })} /></FieldGroup>
              <FieldGroup label="Hero title"><Input value={content.home.hero.title} onChange={(e) => setContent({ ...content, home: { ...content.home, hero: { ...content.home.hero, title: e.target.value } } })} /></FieldGroup>
              <FieldGroup label="Hero subtitle"><Textarea rows={2} value={content.home.hero.subtitle} onChange={(e) => setContent({ ...content, home: { ...content.home, hero: { ...content.home.hero, subtitle: e.target.value } } })} /></FieldGroup>
              <FieldGroup label="Hero image URL"><Input value={content.home.hero.imageUrl} onChange={(e) => setContent({ ...content, home: { ...content.home, hero: { ...content.home.hero, imageUrl: e.target.value } } })} /></FieldGroup>

              <div className="space-y-4">
                <h3 className="font-semibold">Stats</h3>
                {content.home.stats.map((stat, i) => (
                  <div key={i} className="grid sm:grid-cols-3 gap-3 p-4 border rounded-lg">
                    <Input placeholder="Icon (Camera, Users, Award, Star)" value={stat.icon} onChange={(e) => {
                      const stats = [...content.home.stats];
                      stats[i] = { ...stats[i], icon: e.target.value };
                      setContent({ ...content, home: { ...content.home, stats } });
                    }} />
                    <Input placeholder="Value" value={stat.value} onChange={(e) => {
                      const stats = [...content.home.stats];
                      stats[i] = { ...stats[i], value: e.target.value };
                      setContent({ ...content, home: { ...content.home, stats } });
                    }} />
                    <Input placeholder="Label" value={stat.label} onChange={(e) => {
                      const stats = [...content.home.stats];
                      stats[i] = { ...stats[i], label: e.target.value };
                      setContent({ ...content, home: { ...content.home, stats } });
                    }} />
                  </div>
                ))}
              </div>

              {(['servicesSection', 'projectsSection', 'testimonialsSection', 'cta'] as const).map((section) => (
                <div key={section} className="grid sm:grid-cols-2 gap-4 p-4 border rounded-lg">
                  <FieldGroup label={`${section} title`}>
                    <Input value={content.home[section].title} onChange={(e) => setContent({ ...content, home: { ...content.home, [section]: { ...content.home[section], title: e.target.value } } })} />
                  </FieldGroup>
                  <FieldGroup label={`${section} subtitle`}>
                    <Input value={content.home[section].subtitle} onChange={(e) => setContent({ ...content, home: { ...content.home, [section]: { ...content.home[section], subtitle: e.target.value } } })} />
                  </FieldGroup>
                </div>
              ))}

              <Button onClick={() => saveKey('home')} disabled={saving === 'home'}>
                {saving === 'home' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save homepage
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="about">
          <Card>
            <CardHeader><CardTitle>About page</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <FieldGroup label="Hero title"><Input value={content.about.hero.title} onChange={(e) => setContent({ ...content, about: { ...content.about, hero: { ...content.about.hero, title: e.target.value } } })} /></FieldGroup>
              <FieldGroup label="Hero subtitle"><Textarea rows={2} value={content.about.hero.subtitle} onChange={(e) => setContent({ ...content, about: { ...content.about, hero: { ...content.about.hero, subtitle: e.target.value } } })} /></FieldGroup>
              <FieldGroup label="Hero image URL"><Input value={content.about.hero.imageUrl} onChange={(e) => setContent({ ...content, about: { ...content.about, hero: { ...content.about.hero, imageUrl: e.target.value } } })} /></FieldGroup>
              <FieldGroup label="Story title"><Input value={content.about.story.title} onChange={(e) => setContent({ ...content, about: { ...content.about, story: { ...content.about.story, title: e.target.value } } })} /></FieldGroup>
              <FieldGroup label="Story paragraphs">
                <StringListEditor values={content.about.story.paragraphs} onChange={(paragraphs) => setContent({ ...content, about: { ...content.about, story: { ...content.about.story, paragraphs } } })} />
              </FieldGroup>
              <FieldGroup label="Story image URL"><Input value={content.about.story.imageUrl} onChange={(e) => setContent({ ...content, about: { ...content.about, story: { ...content.about.story, imageUrl: e.target.value } } })} /></FieldGroup>
              <FieldGroup label="Mission"><Textarea rows={3} value={content.about.mission.content} onChange={(e) => setContent({ ...content, about: { ...content.about, mission: { ...content.about.mission, content: e.target.value } } })} /></FieldGroup>
              <FieldGroup label="Vision"><Textarea rows={3} value={content.about.vision.content} onChange={(e) => setContent({ ...content, about: { ...content.about, vision: { ...content.about.vision, content: e.target.value } } })} /></FieldGroup>
              <FieldGroup label="Team section title"><Input value={content.about.teamSection.title} onChange={(e) => setContent({ ...content, about: { ...content.about, teamSection: { ...content.about.teamSection, title: e.target.value } } })} /></FieldGroup>
              <FieldGroup label="CTA title"><Input value={content.about.cta.title} onChange={(e) => setContent({ ...content, about: { ...content.about, cta: { ...content.about.cta, title: e.target.value } } })} /></FieldGroup>
              <FieldGroup label="CTA subtitle"><Input value={content.about.cta.subtitle} onChange={(e) => setContent({ ...content, about: { ...content.about, cta: { ...content.about.cta, subtitle: e.target.value } } })} /></FieldGroup>
              <Button onClick={() => saveKey('about')} disabled={saving === 'about'}>
                {saving === 'about' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save about page
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle>Contact page</CardTitle>
              <CardDescription>Contact details come from Business settings. Edit the page hero here.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FieldGroup label="Hero title"><Input value={content.contact.hero.title} onChange={(e) => setContent({ ...content, contact: { hero: { ...content.contact.hero, title: e.target.value } } })} /></FieldGroup>
              <FieldGroup label="Hero subtitle"><Textarea rows={2} value={content.contact.hero.subtitle} onChange={(e) => setContent({ ...content, contact: { hero: { ...content.contact.hero, subtitle: e.target.value } } })} /></FieldGroup>
              <Button onClick={() => saveKey('contact')} disabled={saving === 'contact'}>
                {saving === 'contact' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save contact page
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services">
          <Card>
            <CardHeader><CardTitle>Services page</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <FieldGroup label="Hero badge"><Input value={content.services.hero.badge} onChange={(e) => setContent({ ...content, services: { ...content.services, hero: { ...content.services.hero, badge: e.target.value } } })} /></FieldGroup>
              <FieldGroup label="Hero title"><Input value={content.services.hero.title} onChange={(e) => setContent({ ...content, services: { ...content.services, hero: { ...content.services.hero, title: e.target.value } } })} /></FieldGroup>
              <FieldGroup label="Hero subtitle"><Textarea rows={2} value={content.services.hero.subtitle} onChange={(e) => setContent({ ...content, services: { ...content.services, hero: { ...content.services.hero, subtitle: e.target.value } } })} /></FieldGroup>
              <FieldGroup label="Hero image URL"><Input value={content.services.hero.imageUrl} onChange={(e) => setContent({ ...content, services: { ...content.services, hero: { ...content.services.hero, imageUrl: e.target.value } } })} /></FieldGroup>
              <FieldGroup label="How it works title"><Input value={content.services.howItWorks.title} onChange={(e) => setContent({ ...content, services: { ...content.services, howItWorks: { ...content.services.howItWorks, title: e.target.value } } })} /></FieldGroup>
              <Button onClick={() => saveKey('services')} disabled={saving === 'services'}>
                {saving === 'services' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save services page
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="portfolio">
          <div className="grid gap-6">
            <Card>
              <CardHeader><CardTitle>Portfolio page</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <FieldGroup label="Hero title"><Input value={content.portfolio.hero.title} onChange={(e) => setContent({ ...content, portfolio: { hero: { ...content.portfolio.hero, title: e.target.value } } })} /></FieldGroup>
                <FieldGroup label="Hero subtitle"><Textarea rows={2} value={content.portfolio.hero.subtitle} onChange={(e) => setContent({ ...content, portfolio: { hero: { ...content.portfolio.hero, subtitle: e.target.value } } })} /></FieldGroup>
                <Button onClick={() => saveKey('portfolio')} disabled={saving === 'portfolio'}>
                  {saving === 'portfolio' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save portfolio page
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Pricing page</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <FieldGroup label="Hero badge"><Input value={content.pricing.hero.badge} onChange={(e) => setContent({ ...content, pricing: { ...content.pricing, hero: { ...content.pricing.hero, badge: e.target.value } } })} /></FieldGroup>
                <FieldGroup label="Hero title"><Input value={content.pricing.hero.title} onChange={(e) => setContent({ ...content, pricing: { ...content.pricing, hero: { ...content.pricing.hero, title: e.target.value } } })} /></FieldGroup>
                <FieldGroup label="FAQ section title"><Input value={content.pricing.faqTitle} onChange={(e) => setContent({ ...content, pricing: { ...content.pricing, faqTitle: e.target.value } })} /></FieldGroup>
                <Button onClick={() => saveKey('pricing')} disabled={saving === 'pricing'}>
                  {saving === 'pricing' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save pricing page
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="packages">
          <PricingPackagesEditor />
        </TabsContent>

        <TabsContent value="team">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div><CardTitle>Team members</CardTitle><CardDescription>Shown on the About page.</CardDescription></div>
              <Button size="sm" onClick={() => setTeam([...team, { id: '', name: '', role: '', image_url: '', bio: null, sort_order: team.length + 1, is_active: true } as TeamMember])}>
                <Plus className="h-4 w-4 mr-2" /> Add member
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {team.map((member, i) => (
                <div key={member.id || `new-${i}`} className="p-4 border rounded-lg space-y-3">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Input placeholder="Name" value={member.name} onChange={(e) => { const next = [...team]; next[i] = { ...member, name: e.target.value }; setTeam(next); }} />
                    <Input placeholder="Role" value={member.role} onChange={(e) => { const next = [...team]; next[i] = { ...member, role: e.target.value }; setTeam(next); }} />
                    <Input placeholder="Image URL" value={member.image_url ?? ''} onChange={(e) => { const next = [...team]; next[i] = { ...member, image_url: e.target.value }; setTeam(next); }} className="sm:col-span-2" />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => saveTeamMember(member)}>Save</Button>
                    {member.id && <Button size="sm" variant="outline" onClick={() => deleteTeamMember(member.id)}><Trash2 className="h-4 w-4" /></Button>}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faqs">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div><CardTitle>Pricing FAQs</CardTitle></div>
              <Button size="sm" onClick={() => setFaqs([...faqs, { id: '', question: '', answer: '', page: 'pricing', sort_order: faqs.length + 1, is_active: true }])}>
                <Plus className="h-4 w-4 mr-2" /> Add FAQ
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={faq.id || `faq-${i}`} className="p-4 border rounded-lg space-y-3">
                  <Input placeholder="Question" value={faq.question} onChange={(e) => { const next = [...faqs]; next[i] = { ...faq, question: e.target.value }; setFaqs(next); }} />
                  <Textarea placeholder="Answer" rows={2} value={faq.answer} onChange={(e) => { const next = [...faqs]; next[i] = { ...faq, answer: e.target.value }; setFaqs(next); }} />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => saveFaq(faq)}>Save</Button>
                    {faq.id && <Button size="sm" variant="outline" onClick={() => deleteFaq(faq.id)}><Trash2 className="h-4 w-4" /></Button>}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testimonials">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div><CardTitle>Testimonials</CardTitle><CardDescription>Featured testimonials appear on the homepage.</CardDescription></div>
              <Button size="sm" onClick={() => setTestimonials([{ client_name: '', client_title: '', content: '', rating: 5, is_featured: true }, ...testimonials])}>
                <Plus className="h-4 w-4 mr-2" /> Add
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {testimonials.map((t, i) => (
                <div key={t.id || `t-${i}`} className="p-4 border rounded-lg space-y-3">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Input placeholder="Client name" value={t.client_name} onChange={(e) => { const next = [...testimonials]; next[i] = { ...t, client_name: e.target.value }; setTestimonials(next); }} />
                    <Input placeholder="Title" value={t.client_title ?? ''} onChange={(e) => { const next = [...testimonials]; next[i] = { ...t, client_title: e.target.value }; setTestimonials(next); }} />
                  </div>
                  <Textarea placeholder="Testimonial" rows={2} value={t.content} onChange={(e) => { const next = [...testimonials]; next[i] = { ...t, content: e.target.value }; setTestimonials(next); }} />
                  <div className="flex items-center gap-4">
                    <Input type="number" min={1} max={5} className="w-20" value={t.rating} onChange={(e) => { const next = [...testimonials]; next[i] = { ...t, rating: Number(e.target.value) }; setTestimonials(next); }} />
                    <div className="flex items-center gap-2">
                      <Switch checked={!!t.is_featured} onCheckedChange={(checked) => { const next = [...testimonials]; next[i] = { ...t, is_featured: checked }; setTestimonials(next); }} />
                      <span className="text-sm">Featured on homepage</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => saveTestimonial(t)}>Save</Button>
                    {t.id && <Button size="sm" variant="outline" onClick={() => deleteTestimonial(t.id)}><Trash2 className="h-4 w-4" /></Button>}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
