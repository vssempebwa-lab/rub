'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Camera, Eye, EyeOff, ArrowRight, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { getDashboardPath } from '@/features/auth/utils/dashboard-path';
import { toast } from '@/hooks/use-toast';

export default function LoginPage() {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'client' as 'client' | 'photographer',
  });

  useEffect(() => {
    async function checkExistingSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setCheckingSession(false);
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        router.replace(getDashboardPath(profile?.role));
      } catch {
        setCheckingSession(false);
      }
    }

    checkExistingSession();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (error) throw error;

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        toast({ title: 'Welcome back', description: 'Opening your workspace...' });
        router.push(getDashboardPath(profile?.role));
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
        });
        if (error) throw error;
        if (data.user) {
          await supabase.from('profiles').insert([{
            id: data.user.id,
            email: form.email,
            full_name: form.fullName,
            role: form.role,
          }]);
          toast({ title: 'Account created', description: 'You can now sign in to your workspace.' });
          setIsLogin(true);
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="relative hidden lg:flex flex-col justify-between p-10 text-white overflow-hidden">
        <Image
          src="https://images.pexels.com/photos/2253870/pexels-photo-2253870.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt=""
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/75 via-black/55 to-primary/40" />
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2">
            <Camera className="h-7 w-7" />
            <span className="font-[family-name:var(--font-playfair)] text-2xl font-bold">Rub Shoots</span>
          </Link>
        </div>
        <div className="relative z-10 max-w-md">
          <p className="text-xs uppercase tracking-[0.25em] text-white/70 mb-3">Client & team portal</p>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl font-bold mb-4 leading-tight">
            Your galleries, bookings, and workspace — separate from our public site.
          </h1>
          <p className="text-white/80 text-sm leading-relaxed">
            Sign in to manage events, upload photos, review bookings, or access your private galleries. Visitors browsing our portfolio stay on the public website.
          </p>
        </div>
        <Link href="/" className="relative z-10 inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors">
          <Globe className="h-4 w-4" />
          Back to public website
        </Link>
      </div>

      <div className="flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-16 bg-background">
        <div className="w-full max-w-md mx-auto">
          <div className="lg:hidden mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <Camera className="h-7 w-7 text-primary" />
              <span className="font-[family-name:var(--font-playfair)] text-xl font-bold">Rub Shoots</span>
            </Link>
            <p className="text-sm text-muted-foreground">Sign in to your workspace</p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">{isLogin ? 'Sign in to workspace' : 'Create your account'}</h2>
            <p className="text-sm text-muted-foreground">
              {isLogin
                ? 'For clients, photographers, and admins — not the public marketing site.'
                : 'Register as a client or photographer to access your dashboard.'}
            </p>
          </div>

          <div className="bg-card border rounded-xl p-6 sm:p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Full name</label>
                  <Input
                    placeholder="John Doe"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    required={!isLogin}
                  />
                </div>
              )}
              <div>
                <label className="text-sm font-medium mb-1.5 block">Email</label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {!isLogin && (
                <div>
                  <label className="text-sm font-medium mb-1.5 block">I am a</label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['client', 'photographer'] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setForm({ ...form, role: r })}
                        className={`py-2.5 rounded-lg text-sm font-medium border transition-colors capitalize ${
                          form.role === r
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background border-input hover:bg-muted'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Please wait...' : isLogin ? 'Enter workspace' : 'Create account'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-primary hover:underline"
              >
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>
          </div>

          <p className="text-center mt-6 text-sm text-muted-foreground">
            <Link href="/" className="inline-flex items-center gap-1.5 hover:text-foreground">
              <Globe className="h-4 w-4" />
              Return to public website
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
