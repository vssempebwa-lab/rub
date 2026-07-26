import type { Metadata } from 'next';
import { Users } from 'lucide-react';
import { MarketingPage } from '@/components/layout/marketing-page';
import { TeamMarquee } from '@/components/team/team-marquee';
import { supabase } from '@/lib/supabase';
import type { TeamMember } from '@/types';

export const metadata: Metadata = {
  title: 'Our Team | Rub Shoots Photography',
  description: 'Meet the photographers, videographers, editors, and studio team behind Rub Shoots Photography.',
};

export const dynamic = 'force-dynamic';

async function getTeamMembers() {
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })
    .limit(6);

  if (error) {
    console.error('Unable to load team members', error.message);
    return [];
  }

  return (data as TeamMember[]) ?? [];
}

export default async function TeamPage() {
  const teamMembers = await getTeamMembers();

  return (
    <MarketingPage>
      <section className="py-20 lg:py-28 bg-muted/20 border-b">
        <div className="max-w-4xl mx-auto px-4 text-center sm:px-6 lg:px-8">
          <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Users className="h-6 w-6" />
          </div>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl font-bold md:text-6xl">
            Our Team
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Meet the creative team behind Rub Shoots Photography, the people shaping each session from the first conversation to the final gallery.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {teamMembers.length > 0 ? (
            <TeamMarquee members={teamMembers} />
          ) : (
            <div className="mx-auto max-w-2xl rounded-xl border bg-card p-10 text-center">
              <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold">
                Team profiles are coming soon
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                The studio team is being curated for launch. Check back soon to meet the photographers, videographers, editors, and coordinators behind the work.
              </p>
            </div>
          )}
        </div>
      </section>
    </MarketingPage>
  );
}
