import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Bot, Sparkles, Link as LinkIcon, Pencil, Trash2 } from 'lucide-react';
import { CompanySelector } from '@/components/ui/company-selector';
import type { OwnCompany } from '@/services/project-service';
import type { StoredICPProfile } from '@/services';
import { useEffect, useState } from 'react';
// Agent button removed during reset

interface ICP {
  name: string;
  description: string;
  demographics: {
    age: string;
    gender: string;
    location: string;
    income: string;
    education: string;
  };
  psychographics: {
    interests: string[];
    values: string[];
    lifestyle: string;
    painPoints: string[];
  };
  behavior: {
    onlineHabits: string[];
    purchasingBehavior: string;
    brandPreferences: string[];
  };
  goals: string[];
  challenges: string[];
  preferredChannels: string[];
}

interface ICPProfilesProps {
  generatedICPs: ICP[];
  activeCompanyId?: string;
  onCompanyIdChange?: (id: string) => void;
}

export function ICPProfiles({
  generatedICPs,
  activeCompanyId,
  onCompanyIdChange,
}: ICPProfilesProps) {
  const [companyId, setCompanyId] = useState<string>(activeCompanyId || '');
  const [companyName, setCompanyName] = useState<string>('');
  const [profiles, setProfiles] = useState<StoredICPProfile[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (activeCompanyId) setCompanyId(activeCompanyId);
  }, [activeCompanyId]);

  useEffect(() => {
    const loadActive = async () => {
      try {
        const resp = await fetch('/api/company', { cache: 'no-store' });
        if (resp.ok) {
          const data = await resp.json();
          const active = data?.active;
          if (active) {
            if (!companyId) setCompanyId(active.id || '');
            setCompanyName(active.name || '');
          }
        }
      } catch (_) {}
    };
    if (!companyName) loadActive();
  }, [companyId, companyName]);

  useEffect(() => {
    const load = async () => {
      if (!companyId) return;
      const resp = await fetch(
        `/api/icp?companyId=${encodeURIComponent(companyId)}`,
        { cache: 'no-store' },
      );
      if (resp.ok) {
        const json = await resp.json();
        setProfiles(json?.profiles || []);
      }
    };
    load();
  }, [companyId]);
  return (
    <Card className='mt-4'>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='flex items-center gap-2'>
              <Bot className='h-5 w-5 text-primary' />
              ICP Profiles
            </CardTitle>
            <CardDescription>
              View and manage your generated Ideal Customer Profiles
            </CardDescription>
          </div>
          <div className='flex items-center gap-2'>
            <CompanySelector
              value={companyName}
              onChange={() => {}}
              onCompanySelect={(c: OwnCompany) => {
                setCompanyName(c?.name || '');
              }}
              onCompanyIdSelected={(id) => {
                setCompanyId(id);
                onCompanyIdChange?.(id);
              }}
              selectedCompanyId={companyId}
              allowCreate={false}
              className='min-w-[260px]'
            />
            <Button size='sm' className='flex items-center gap-2' disabled>
              Analyze ICPs (coming soon)
            </Button>
            <Button
              size='sm'
              variant='destructive'
              className='flex items-center gap-2'
              disabled={!companyId || isDeleting}
              onClick={async () => {
                if (!companyId) return;
                try {
                  setIsDeleting(true);
                  await fetch(
                    `/api/icp?companyId=${encodeURIComponent(companyId)}`,
                    {
                      method: 'DELETE',
                    },
                  );
                  // Refresh list
                  const resp = await fetch(
                    `/api/icp?companyId=${encodeURIComponent(companyId)}`,
                    {
                      cache: 'no-store',
                    },
                  );
                  if (resp.ok) {
                    const json = await resp.json();
                    setProfiles(json?.profiles || []);
                  } else {
                    setProfiles([]);
                  }
                } finally {
                  setIsDeleting(false);
                }
              }}>
              <Trash2 className='h-4 w-4' /> Delete All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {profiles.length > 0 || generatedICPs.length > 0 ? (
          <div className='space-y-4'>
            <h3 className='font-semibold'>
              Generated ICPs ({profiles.length || generatedICPs.length})
            </h3>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              {(profiles.length > 0
                ? profiles
                : generatedICPs.map(
                    (g, i) =>
                      ({
                        id: `${i}`,
                        profileData: g,
                      } as unknown as StoredICPProfile),
                  )
              ).map((p) => (
                <Card key={p.id} className='bg-muted/30'>
                  <CardHeader className='pb-3'>
                    <CardTitle className='text-2xl'>
                      ICP: {p.profileData.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <p className='text-sm text-muted-foreground line-clamp-4'>
                      {p.profileData.description}
                    </p>
                    <div className='flex items-center gap-2'>
                      <Button className='flex-1' variant='default'>
                        <Sparkles className='mr-2 h-4 w-4' /> Use in Designer
                      </Button>
                      <Button
                        variant='outline'
                        size='icon'
                        aria-label='Copy link'>
                        <LinkIcon className='h-4 w-4' />
                      </Button>
                      <Button variant='outline' size='icon' aria-label='Edit'>
                        <Pencil className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='destructive'
                        size='icon'
                        aria-label='Delete'
                        onClick={async () => {
                          try {
                            await fetch(
                              `/api/icp?id=${encodeURIComponent(p.id)}`,
                              { method: 'DELETE' },
                            );
                            setProfiles((prev) =>
                              prev.filter((x) => x.id !== p.id),
                            );
                          } catch (_) {}
                        }}>
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className='text-center py-8'>
            <p className='text-muted-foreground'>
              No ICP profiles generated yet. Go to the ICP Generator tab to
              create your first profiles.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
