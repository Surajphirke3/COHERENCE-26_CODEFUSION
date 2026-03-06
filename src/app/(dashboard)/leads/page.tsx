// src/app/(dashboard)/leads/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { Upload } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { LeadTable } from '@/components/leads/LeadTable';
import { useLeads } from '@/lib/hooks/useLeads';

export default function LeadsPage() {
  const { total } = useLeads({ limit: 1 });

  return (
    <div>
      <PageHeader title="Leads" subtitle={`${total} total leads`}>
        <Link href="/leads/import">
          <Button icon={<Upload size={16} />}>Import Leads</Button>
        </Link>
      </PageHeader>

      <div className="p-6">
        <LeadTable />
      </div>
    </div>
  );
}
