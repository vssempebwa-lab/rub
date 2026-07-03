'use client';

import { useEffect, useState } from 'react';
import { Loader2, Plus, Save, Star, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import type { PricingPackage } from '@/types';

type PackageDraft = Omit<PricingPackage, 'created_at'> & { created_at?: string };

const TIERS = ['silver', 'gold', 'premium', 'custom'] as const;

function emptyPackage(sortOrder: number): PackageDraft {
  return {
    id: '',
    name: '',
    tier: 'silver',
    price: null,
    description: '',
    features: [],
    is_popular: false,
    sort_order: sortOrder,
  };
}

function FeaturesEditor({
  values,
  onChange,
}: {
  values: string[];
  onChange: (values: string[]) => void;
}) {
  const items = values.length > 0 ? values : [''];

  return (
    <div className="space-y-2">
      {items.map((value, index) => (
        <div key={index} className="flex gap-2">
          <Input
            value={value}
            placeholder="e.g. 4-hour coverage"
            onChange={(e) => {
              const next = [...items];
              next[index] = e.target.value;
              onChange(next.filter((v, i) => v.trim() || i < next.length - 1));
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => onChange(items.filter((_, i) => i !== index))}
            disabled={items.length === 1}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...items, ''])}>
        <Plus className="h-4 w-4 mr-2" /> Add feature
      </Button>
    </div>
  );
}

export function PricingPackagesEditor() {
  const [packages, setPackages] = useState<PackageDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    loadPackages();
  }, []);

  async function loadPackages() {
    setLoading(true);
    const { data, error } = await supabase
      .from('pricing_packages')
      .select('*')
      .order('sort_order');

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setPackages(
        (data ?? []).map((pkg) => ({
          ...pkg,
          features: pkg.features ?? [],
        })),
      );
    }
    setLoading(false);
  }

  function updatePackage(index: number, patch: Partial<PackageDraft>) {
    setPackages((current) => {
      const next = [...current];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  }

  async function setPopularPackage(packageId: string, popular: boolean) {
    if (popular) {
      const { error: clearError } = await supabase
        .from('pricing_packages')
        .update({ is_popular: false })
        .neq('id', packageId);

      if (clearError) {
        toast({ title: 'Error', description: clearError.message, variant: 'destructive' });
        return;
      }
    }

    const { error } = await supabase
      .from('pricing_packages')
      .update({ is_popular: popular })
      .eq('id', packageId);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }

    setPackages((current) =>
      current.map((pkg) => ({
        ...pkg,
        is_popular: popular ? pkg.id === packageId : pkg.id === packageId ? false : pkg.is_popular,
      })),
    );

    toast({
      title: popular ? 'Popular package updated' : 'Popular badge removed',
      description: popular
        ? 'This package is now highlighted on the pricing page.'
        : 'No package is marked as popular.',
    });
  }

  async function savePackage(pkg: PackageDraft, index: number) {
    if (!pkg.name.trim()) {
      toast({ title: 'Name required', description: 'Enter a package name.', variant: 'destructive' });
      return;
    }

    setSavingId(pkg.id || `new-${index}`);

    const payload = {
      name: pkg.name.trim(),
      tier: pkg.tier,
      price: pkg.price,
      description: pkg.description?.trim() || null,
      features: (pkg.features ?? []).map((f) => f.trim()).filter(Boolean),
      is_popular: pkg.is_popular,
      sort_order: pkg.sort_order,
    };

    if (payload.is_popular) {
      await supabase.from('pricing_packages').update({ is_popular: false });
    }

    if (pkg.id) {
      const { error } = await supabase.from('pricing_packages').update(payload).eq('id', pkg.id);
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
        setSavingId(null);
        return;
      }
    } else {
      const { error } = await supabase.from('pricing_packages').insert([payload]);
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
        setSavingId(null);
        return;
      }
    }

    setSavingId(null);
    toast({ title: 'Package saved', description: `${pkg.name} is live on the pricing page.` });
    loadPackages();
  }

  async function deletePackage(id: string) {
    const { error } = await supabase.from('pricing_packages').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Package removed' });
    loadPackages();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>Pricing packages</CardTitle>
          <CardDescription>
            Edit package names, prices, features, and choose which one shows the &quot;Most Popular&quot; badge.
          </CardDescription>
        </div>
        <Button
          size="sm"
          onClick={() => setPackages([...packages, emptyPackage(packages.length + 1)])}
        >
          <Plus className="h-4 w-4 mr-2" /> Add package
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {packages.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            No packages yet. Add your first pricing package.
          </p>
        )}

        {packages.map((pkg, index) => {
          const saving = savingId === (pkg.id || `new-${index}`);
          return (
            <div
              key={pkg.id || `new-${index}`}
              className={`p-5 border rounded-xl space-y-4 ${pkg.is_popular ? 'border-amber-400 bg-amber-50/30' : ''}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{pkg.name || 'New package'}</h3>
                  {pkg.is_popular && (
                    <Badge className="bg-primary text-primary-foreground">
                      <Star className="h-3 w-3 mr-1 fill-current" /> Most Popular
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor={`popular-${pkg.id || index}`} className="text-sm text-muted-foreground">
                    Mark as popular
                  </Label>
                  <Switch
                    id={`popular-${pkg.id || index}`}
                    checked={pkg.is_popular}
                    disabled={false}
                    onCheckedChange={async (checked) => {
                      if (!pkg.id) {
                        if (checked) {
                          setPackages((current) =>
                            current.map((item, i) => ({
                              ...item,
                              is_popular: i === index,
                            })),
                          );
                        } else {
                          updatePackage(index, { is_popular: false });
                        }
                        return;
                      }
                      await setPopularPackage(pkg.id, checked);
                    }}
                  />
                </div>
              </div>

              {!pkg.id && pkg.is_popular && (
                <p className="text-xs text-muted-foreground">
                  Popular badge will apply when you save this package.
                </p>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Package name</Label>
                  <Input
                    value={pkg.name}
                    placeholder="Gold"
                    onChange={(e) => updatePackage(index, { name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tier</Label>
                  <Select value={pkg.tier} onValueChange={(tier) => updatePackage(index, { tier })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIERS.map((tier) => (
                        <SelectItem key={tier} value={tier}>
                          {tier.charAt(0).toUpperCase() + tier.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Price (leave empty for custom quote)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={pkg.price ?? ''}
                    placeholder="100000"
                    onChange={(e) =>
                      updatePackage(index, {
                        price: e.target.value === '' ? null : Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Display order</Label>
                  <Input
                    type="number"
                    min={0}
                    value={pkg.sort_order}
                    onChange={(e) =>
                      updatePackage(index, { sort_order: Number(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Short description</Label>
                <Textarea
                  rows={2}
                  value={pkg.description ?? ''}
                  placeholder="Perfect for intimate celebrations"
                  onChange={(e) => updatePackage(index, { description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Features</Label>
                <FeaturesEditor
                  values={pkg.features ?? []}
                  onChange={(features) => updatePackage(index, { features })}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button size="sm" onClick={() => savePackage(pkg, index)} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save package
                </Button>
                {pkg.id && (
                  <Button size="sm" variant="outline" onClick={() => deletePackage(pkg.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
