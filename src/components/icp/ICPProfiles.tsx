import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Users,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  X,
  Plus,
  Trash2,
  Loader2,
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import type { ICP } from '@/services/ai';
import type { OwnCompany } from '@/services/project';
import { ICPDetailsModal } from '@/components/icp/ICPDetailsModal';

interface ICPProfilesProps {
  generatedICPs: ICP[];
  activeCompanyId?: string;
  onCompanyIdChange?: (id: string) => void;
  onGenerateMore?: () => void;
}

export function ICPProfiles({
  generatedICPs,
  activeCompanyId,
  onCompanyIdChange,
  onGenerateMore,
}: ICPProfilesProps) {
  const [companyId, setCompanyId] = useState<string>(activeCompanyId || '');
  const [companyName, setCompanyName] = useState<string>('');
  const [selectedICP, setSelectedICP] = useState<ICP | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // tRPC queries and mutations
  const companyListQuery = trpc.company.list.useQuery();
  const icpListQuery = trpc.icp.getByCompany.useQuery(
    { companyId },
    { enabled: !!companyId },
  );
  const deleteICPMutation = trpc.icp.delete.useMutation();
  const deleteAllICPsMutation = trpc.icp.deleteAllForCompany.useMutation();
  const generateMoreICPsMutation = trpc.icp.generateMore.useMutation();

  // Update company state when activeCompanyId changes
  useEffect(() => {
    if (activeCompanyId) {
      setCompanyId(activeCompanyId);
      // Find the company name for the active company
      const activeCompany = companyListQuery.data?.list?.find(
        (company) => company.id.toString() === activeCompanyId,
      );
      if (activeCompany) {
        setCompanyName(activeCompany.name || '');
      }
    } else {
      // Reset to empty state when no company is selected
      setCompanyId('');
      setCompanyName('');
    }
  }, [activeCompanyId, companyListQuery.data]);

  const handleGenerateMore = async () => {
    if (!companyId) return;

    try {
      // Use the tRPC mutation directly for better loading state management
      await generateMoreICPsMutation.mutateAsync({
        companyId: companyId,
      });

      // Refresh the ICP list
      await icpListQuery.refetch();

      // Show success message
      alert('Additional ICPs generated successfully!');

      // Also call the parent callback if provided
      if (onGenerateMore) {
        await onGenerateMore();
      }
    } catch (error) {
      console.error('Error generating more ICPs:', error);
      alert('Failed to generate more ICPs. Please try again.');
    }
  };

  const isLoadingProfiles = icpListQuery.isLoading;
  const isGeneratingMore = generateMoreICPsMutation?.isPending || false;
  const isDeleting = deleteAllICPsMutation.isPending;

  const profiles = icpListQuery.data || [];

  const handleDeleteICP = async (icpId: string) => {
    if (!icpId) return;
    const ok = confirm('Delete this ICP profile? This cannot be undone.');
    if (!ok) return;
    try {
      await deleteICPMutation.mutateAsync({ id: icpId });
      await icpListQuery.refetch();
    } catch (error) {
      console.error('Error deleting ICP:', error);
      alert('Failed to delete ICP profile. Please try again.');
    }
  };

  const handleViewDetails = (icp: any) => {
    // Transform the database format to ICP format
    const transformedICP = {
      ...icp.profile_data,
      id: icp.id,
      company_id: icp.company_id,
      created_at: icp.created_at,
      updated_at: icp.updated_at,
    };
    setSelectedICP(transformedICP);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className='space-y-6 pt-4'>
      <Card className='max-w-6xl mx-auto'>
        <CardHeader className='flex-col space-y-4 sm:flex-row sm:items-start sm:justify-between'>
          <div>
            <CardTitle className='flex items-center gap-2'>
              <Users className='h-5 w-5 text-primary' />
              ICP Profiles
            </CardTitle>
            <CardDescription>
              View and manage your generated Ideal Customer Profiles
            </CardDescription>
          </div>
          <div className='flex flex-col space-y-3 sm:flex-row sm:items-end sm:space-y-0 sm:gap-2'>
            <Button
              className='flex items-center gap-2 h-10'
              disabled={
                !companyId ||
                isGeneratingMore ||
                generateMoreICPsMutation.isPending
              }
              onClick={handleGenerateMore}
              title='Generate ICP profiles using current company data'>
              {isGeneratingMore || generateMoreICPsMutation.isPending ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                <Plus className='h-4 w-4' />
              )}
              {isGeneratingMore || generateMoreICPsMutation.isPending
                ? 'Generating...'
                : 'Generate ICPs'}
            </Button>
            <Button
              variant='destructive'
              className='flex items-center gap-2 h-10'
              disabled={!companyId || isDeleting}
              title='Delete all ICP profiles for this company'
              onClick={async () => {
                if (!companyId) return;
                if (
                  !confirm(
                    'Are you sure you want to delete all ICP profiles for this company?',
                  )
                ) {
                  return;
                }
                try {
                  await deleteAllICPsMutation.mutateAsync({ companyId });
                  await icpListQuery.refetch();
                } catch (error) {
                  console.error('Error deleting ICPs:', error);
                  alert('Failed to delete ICP profiles. Please try again.');
                }
              }}>
              <Trash2 className='h-4 w-4' /> Delete All
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* ICP Profiles Content */}
      <div className='max-w-6xl mx-auto'>
        {isLoadingProfiles ||
        isGeneratingMore ||
        generateMoreICPsMutation.isPending ? (
          <div className='flex items-center justify-center py-12'>
            <div className='flex items-center gap-3'>
              <Loader2 className='h-6 w-6 animate-spin text-primary' />
              <span className='text-muted-foreground'>
                {isGeneratingMore || generateMoreICPsMutation.isPending
                  ? 'Generating new ICP profiles...'
                  : 'Loading ICP profiles...'}
              </span>
            </div>
          </div>
        ) : companyId && profiles.length > 0 ? (
          <div className='space-y-4'>
            <h3 className='font-semibold'>
              Generated ICPs for {companyName} ({profiles.length})
            </h3>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch'>
              {profiles
                .map((p: any) => {
                  // Ensure profile_data exists and has the expected structure
                  if (!p.profile_data) {
                    console.warn('Profile data is missing for profile:', p);
                    return null;
                  }

                  return (
                    <Card
                      key={p.id}
                      className='bg-muted/30 relative flex flex-col'>
                      {/* Action buttons (top-right) */}
                      <div className='absolute top-3 right-3 flex gap-1'>
                        <Button
                          variant='destructive'
                          size='icon'
                          className='h-7 w-7'
                          title='Delete this ICP profile'
                          onClick={() => handleDeleteICP(p.id)}
                          disabled={deleteICPMutation.isPending}>
                          <X className='h-4 w-4' />
                        </Button>
                      </div>
                      <CardHeader className='pb-3 pr-20 pt-2'>
                        <div className='flex items-start justify-start'>
                          <div>
                            <CardTitle className='text-xl'>
                              {p.profile_data.icp_name ||
                                p.profile_data.name ||
                                'Unnamed ICP'}
                            </CardTitle>
                            <p className='text-sm text-muted-foreground'>
                              {p.profile_data.business_model || 'N/A'} •{' '}
                              {p.profile_data.abm_tier || 'N/A'} • Score:{' '}
                              {p.profile_data.fit_score || 'N/A'}
                            </p>
                            <div className='mt-2'>
                              <Badge
                                variant={
                                  (p.profile_data.confidence || 'medium') ===
                                  'high'
                                    ? 'default'
                                    : (p.profile_data.confidence ||
                                        'medium') === 'medium'
                                    ? 'secondary'
                                    : 'outline'
                                }>
                                Confidence:{' '}
                                {p.profile_data.confidence || 'medium'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className='flex flex-col h-full'>
                        <div className='space-y-4 flex-1'>
                          {/* Customer Segments */}
                          <div>
                            <h4 className='font-semibold text-sm flex items-center gap-2 mb-2'>
                              <Target className='h-4 w-4' />
                              Customer Segments
                            </h4>
                            <p className='text-sm text-muted-foreground'>
                              {p.profile_data.segments?.join(', ') ||
                                p.profile_data.customer_segments ||
                                'No segments defined'}
                            </p>
                          </div>

                          {/* Pain Points */}
                          <div>
                            <h4 className='font-semibold text-sm flex items-center gap-2 mb-2'>
                              <AlertTriangle className='h-4 w-4' />
                              Pain Points
                            </h4>
                            <p className='text-sm text-muted-foreground'>
                              {p.profile_data.needs_pain_goals?.pains?.join(
                                ', ',
                              ) ||
                                p.profile_data.pain_points ||
                                'No pain points defined'}
                            </p>
                          </div>

                          {/* Jobs to be Done */}
                          <div>
                            <h4 className='font-semibold text-sm flex items-center gap-2 mb-2'>
                              <CheckCircle className='h-4 w-4' />
                              Jobs to be Done
                            </h4>
                            <p className='text-sm text-muted-foreground'>
                              {p.profile_data.needs_pain_goals?.jobs_to_be_done?.join(
                                ', ',
                              ) ||
                                p.profile_data.jobs_to_be_done ||
                                'No jobs defined'}
                            </p>
                          </div>

                          {/* Desired Outcomes */}
                          <div>
                            <h4 className='font-semibold text-sm flex items-center gap-2 mb-2'>
                              <TrendingUp className='h-4 w-4' />
                              Desired Outcomes
                            </h4>
                            <p className='text-sm text-muted-foreground'>
                              {p.profile_data.needs_pain_goals?.desired_outcomes?.join(
                                ', ',
                              ) ||
                                p.profile_data.desired_outcomes ||
                                'No outcomes defined'}
                            </p>
                          </div>

                          {/* Buying Triggers */}
                          <div>
                            <h4 className='font-semibold text-sm flex items-center gap-2 mb-2'>
                              <Target className='h-4 w-4' />
                              Buying Triggers
                            </h4>
                            <p className='text-sm text-muted-foreground'>
                              {p.profile_data.buying_triggers?.join(', ') ||
                                'No triggers defined'}
                            </p>
                          </div>

                          {/* Common Objections */}
                          <div>
                            <h4 className='font-semibold text-sm flex items-center gap-2 mb-2'>
                              <XCircle className='h-4 w-4' />
                              Common Objections
                            </h4>
                            <p className='text-sm text-muted-foreground'>
                              {p.profile_data.common_objections?.join(', ') ||
                                'No objections defined'}
                            </p>
                          </div>

                          {/* Value Proposition */}
                          <div>
                            <h4 className='font-semibold text-sm flex items-center gap-2 mb-2'>
                              <CheckCircle className='h-4 w-4' />
                              Value Proposition
                            </h4>
                            <p className='text-sm text-muted-foreground'>
                              {p.profile_data.value_prop_alignment
                                ?.value_prop ||
                                p.profile_data.value_proposition ||
                                'No value proposition defined'}
                            </p>
                          </div>

                          {/* Go-to-Market Strategy */}
                          <div>
                            <h4 className='font-semibold text-sm flex items-center gap-2 mb-2'>
                              <TrendingUp className='h-4 w-4' />
                              Go-to-Market Strategy
                            </h4>
                            <p className='text-sm text-muted-foreground'>
                              {p.profile_data.go_to_market?.primary_channels?.join(
                                ', ',
                              ) ||
                                p.profile_data.go_to_market_strategy ||
                                'No strategy defined'}
                            </p>
                          </div>
                        </div>

                        {/* Details Button */}
                        <div className='pt-4 border-t mt-auto'>
                          <Button
                            variant='default'
                            className='w-full'
                            onClick={() => handleViewDetails(p)}>
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
                .filter(Boolean)}
            </div>
          </div>
        ) : companyId && profiles.length === 0 ? (
          <div className='text-center py-12'>
            <Users className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
            <h3 className='text-lg font-semibold mb-2'>No ICP Profiles Yet</h3>
            <p className='text-muted-foreground mb-4'>
              Use the &quot;Generate&quot; button in the header above to create
              your first ICP profile.
            </p>
          </div>
        ) : (
          <div className='text-center py-12'>
            <Users className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
            <h3 className='text-lg font-semibold mb-2'>Select a Company</h3>
            <p className='text-muted-foreground'>
              Please select a company from the header above to view ICP
              profiles.
            </p>
          </div>
        )}
      </div>

      {/* ICP Details Modal */}
      <ICPDetailsModal
        icp={selectedICP}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedICP(null);
        }}
      />
    </div>
  );
}
