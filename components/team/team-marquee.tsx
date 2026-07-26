'use client';

import { TeamMemberCard } from '@/components/team/team-member-card';
import type { TeamMember } from '@/types';

export function TeamMarquee({ members }: { members: TeamMember[] }) {
  return (
    <div className="team-marquee overflow-hidden" aria-label="Rub Shoots team members">
      <div className="team-marquee-static grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {members.map((member) => (
          <TeamMemberCard key={member.id} member={member} />
        ))}
      </div>

      <div className="team-marquee-motion">
        <div className="team-marquee-track">
          {[...members, ...members].map((member, index) => (
            <div
              key={`${member.id}-${index}`}
              className="team-marquee-item w-[min(82vw,320px)] shrink-0 sm:w-[330px] lg:w-[340px]"
              aria-hidden={index >= members.length}
            >
              <TeamMemberCard member={member} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
