'use client';

import { useEffect, useState } from 'react';
import { defaultSiteContent } from '../defaults';
import { fetchAllSiteContent, fetchSiteFaqs, fetchTeamMembers } from '../api/site-content';
import type { SiteContentMap, SiteFaq, TeamMember } from '../types';

export function useWebsiteContent() {
  const [content, setContent] = useState<SiteContentMap>(defaultSiteContent);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [faqs, setFaqs] = useState<SiteFaq[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const [siteContent, teamMembers, siteFaqs] = await Promise.all([
        fetchAllSiteContent(),
        fetchTeamMembers(),
        fetchSiteFaqs('pricing'),
      ]);

      if (mounted) {
        setContent(siteContent);
        setTeam(teamMembers);
        setFaqs(siteFaqs);
        setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  return { content, team, faqs, loading, business: content.business };
}
