import Image from 'next/image';
import { Instagram, Music2 } from 'lucide-react';
import type { TeamMember } from '@/types';

const fallbackPhoto =
  'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=600';

function getSocialLinks(member: TeamMember) {
  const links = member.social_links ?? {};
  return {
    instagram: typeof links.instagram === 'string' ? links.instagram : '',
    tiktok: typeof links.tiktok === 'string' ? links.tiktok : '',
  };
}

export function TeamMemberCard({ member }: { member: TeamMember }) {
  const social = getSocialLinks(member);
  const photoUrl = member.photo_url || member.image_url || fallbackPhoto;
  const hasSocial = Boolean(social.instagram || social.tiktok);

  return (
    <article className="bg-card border rounded-xl overflow-hidden group hover:shadow-lg transition-shadow">
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <Image
          src={photoUrl}
          alt={`${member.name}, ${member.role}`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
        />
      </div>
      <div className="p-6">
        <div className="mb-4">
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold leading-tight">
            {member.name}
          </h2>
          <p className="mt-1 text-sm font-medium text-primary">{member.role}</p>
        </div>
        {member.bio && (
          <p className="text-sm leading-relaxed text-muted-foreground">{member.bio}</p>
        )}
        {hasSocial && (
          <div className="mt-5 flex items-center gap-2 border-t pt-4">
            {social.instagram && (
              <a
                href={social.instagram}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                aria-label={`${member.name} on Instagram`}
              >
                <Instagram className="h-4 w-4" />
              </a>
            )}
            {social.tiktok && (
              <a
                href={social.tiktok}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                aria-label={`${member.name} on TikTok`}
              >
                <Music2 className="h-4 w-4" />
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
