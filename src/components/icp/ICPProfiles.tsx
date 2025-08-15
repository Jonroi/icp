import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Bot,
  Sparkles,
  Link as LinkIcon,
  Pencil,
  Trash2,
  Plus,
  Loader2,
} from 'lucide-react';
import { CompanySelector } from '@/components/ui/company-selector';
import type { OwnCompany } from '@/services/project-service';
import type { StoredICPProfile } from '@/services';
import type { ICP } from '@/services/ai/types';
import { useEffect, useState } from 'react';
// Agent button removed during reset

interface ICPProfilesProps {
  generatedICPs: ICP[];
  activeCompanyId?: string;
  onCompanyIdChange?: (id: string) => void;
  onGenerateMore?: () => Promise<void>;
}

export function ICPProfiles({
  generatedICPs,
  activeCompanyId,
  onCompanyIdChange,
  onGenerateMore,
}: ICPProfilesProps) {
  const [companyId, setCompanyId] = useState<string>(activeCompanyId || '');
  const [companyName, setCompanyName] = useState<string>('');
  const [profiles, setProfiles] = useState<StoredICPProfile[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isGeneratingMore, setIsGeneratingMore] = useState(false);

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

  const refreshProfiles = async (id: string) => {
    const resp = await fetch(`/api/icp?companyId=${encodeURIComponent(id)}`, {
      cache: 'no-store',
    });
    if (resp.ok) {
      const json = await resp.json();
      setProfiles(json?.profiles || []);
    }
  };

  useEffect(() => {
    if (!companyId) return;
    void refreshProfiles(companyId);
  }, [companyId]);

  return (
    <Card className='mt-4'>
      <CardHeader className='flex-row items-start justify-between'>
        <div>
          <CardTitle className='flex items-center gap-2'>
            <Bot className='h-5 w-5 text-primary' />
            ICP Profiles
          </CardTitle>
          <CardDescription>
            View and manage your generated Ideal Customer Profiles
          </CardDescription>
        </div>
        <div className='flex items-end gap-2'>
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
            allowDelete={false}
            className='min-w-[260px]'
          />
          <Button
            className='flex items-center gap-2 h-10'
            disabled={!companyId || isGeneratingMore}
            onClick={async () => {
              if (!companyId || !onGenerateMore) return;
              try {
                setIsGeneratingMore(true);
                await onGenerateMore();
                await refreshProfiles(companyId);
              } finally {
                setIsGeneratingMore(false);
              }
            }}
            title='Generate more ICP profiles using current company data'>
            {isGeneratingMore ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <Plus className='h-4 w-4' />
            )}
            {isGeneratingMore ? 'Generating...' : 'Generate More'}
          </Button>
          <Button
            variant='destructive'
            className='flex items-center gap-2 h-10'
            disabled={!companyId || isDeleting}
            title='Delete all ICP profiles for this company'
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
                await refreshProfiles(companyId);
              } finally {
                setIsDeleting(false);
              }
            }}>
            <Trash2 className='h-4 w-4' /> Delete All
          </Button>
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
                    <div className='flex items-center justify-between'>
                      <div>
                        <CardTitle className='text-xl'>
                          {p.profileData.icp_name}
                        </CardTitle>
                        <p className='text-sm text-muted-foreground'>
                          {p.profileData.business_model} •{' '}
                          {p.profileData.abm_tier || 'N/A'} • Score:{' '}
                          {p.profileData.fit_scoring?.score || 'N/A'}
                        </p>
                      </div>
                      <div className='flex items-center gap-1'>
                        {(() => {
                          const confidence = (
                            p.profileData.confidence || 'medium'
                          ).toLowerCase();
                          let bgColor, textColor, borderColor, dotColor;

                          switch (confidence) {
                            case 'high':
                              bgColor = 'bg-emerald-50';
                              textColor = 'text-emerald-700';
                              borderColor = 'border-emerald-200';
                              dotColor = 'bg-emerald-500';
                              break;
                            case 'medium':
                              bgColor = 'bg-amber-50';
                              textColor = 'text-amber-700';
                              borderColor = 'border-amber-200';
                              dotColor = 'bg-amber-500';
                              break;
                            default: // low or any other value
                              bgColor = 'bg-rose-50';
                              textColor = 'text-rose-700';
                              borderColor = 'border-rose-200';
                              dotColor = 'bg-rose-500';
                              break;
                          }

                          return (
                            <span
                              className={`px-2 py-1 rounded-md text-xs font-medium border flex items-center gap-1 ${bgColor} ${textColor} ${borderColor}`}>
                              <span
                                className={`w-2 h-2 rounded-full ${dotColor}`}
                              />
                              {p.profileData.confidence || 'medium'}
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    {/* Business Model & Segments */}
                    <div className='space-y-2'>
                      <h4 className='font-medium text-sm'>Segments</h4>
                      <div className='flex flex-wrap gap-1'>
                        {p.profileData.segments
                          ?.slice(0, 3)
                          .map((segment, i) => (
                            <span
                              key={i}
                              className='px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded-md text-xs font-medium'>
                              {segment}
                            </span>
                          ))}
                        {p.profileData.segments?.length > 3 && (
                          <span className='px-2 py-1 bg-muted text-muted-foreground border border-border rounded-md text-xs'>
                            +{p.profileData.segments.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Key Pain Points */}
                    {p.profileData.needs_pain_goals?.pains && (
                      <div className='space-y-2'>
                        <h4 className='font-medium text-sm'>Key Pain Points</h4>
                        <ul className='text-sm text-muted-foreground space-y-1'>
                          {p.profileData.needs_pain_goals.pains
                            .slice(0, 2)
                            .map((pain, i) => (
                              <li key={i} className='flex items-center gap-2'>
                                <span className='text-red-500 text-lg leading-none'>
                                  •
                                </span>
                                <span>{pain}</span>
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}

                    {/* Buying Triggers */}
                    {p.profileData.buying_triggers && (
                      <div className='space-y-2'>
                        <h4 className='font-medium text-sm'>Buying Triggers</h4>
                        <ul className='text-sm text-muted-foreground space-y-1'>
                          {p.profileData.buying_triggers
                            .slice(0, 2)
                            .map((trigger, i) => (
                              <li key={i} className='flex items-center gap-2'>
                                <span className='text-green-500 text-lg leading-none'>
                                  •
                                </span>
                                <span>{trigger}</span>
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}

                    {/* Actions */}
                    <div className='flex items-center gap-2 pt-2'>
                      <Button
                        className='flex-1'
                        variant='default'
                        size='sm'
                        title='View detailed ICP profile information'>
                        <Sparkles className='mr-2 h-4 w-4' /> View Details
                      </Button>
                      <Button
                        variant='outline'
                        size='icon'
                        title='Copy ICP profile link'
                        aria-label='Copy link'>
                        <LinkIcon className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='outline'
                        size='icon'
                        title='Edit ICP profile'
                        aria-label='Edit'>
                        <Pencil className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='destructive'
                        size='icon'
                        title='Delete this ICP profile'
                        aria-label='Delete'
                        onClick={async () => {
                          try {
                            await fetch(
                              `/api/icp?id=${encodeURIComponent(p.id)}`,
                              {
                                method: 'DELETE',
                              },
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
