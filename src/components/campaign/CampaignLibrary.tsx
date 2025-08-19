import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Edit, Trash2, Eye, Target } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import type { StoredCampaign } from '@/services/database';

interface CampaignLibraryProps {
  companyId: string;
  companyName: string;
  onEditCampaign: (campaign: StoredCampaign) => void;
  onDeleteCampaign: (campaignId: string) => void;
  onViewCampaign: (campaign: StoredCampaign) => void;
}

export function CampaignLibrary({
  companyId,
  companyName,
  onEditCampaign,
  onDeleteCampaign,
  onViewCampaign,
}: CampaignLibraryProps) {
  const [selectedCampaign, setSelectedCampaign] =
    useState<StoredCampaign | null>(null);

  const campaignsQuery = trpc.campaign.getByCompany.useQuery(
    { companyId },
    { enabled: !!companyId },
  );

  const deleteCampaignMutation = trpc.campaign.delete.useMutation();

  const handleDeleteCampaign = async (campaignId: string) => {
    if (confirm('Are you sure you want to delete this campaign?')) {
      try {
        await deleteCampaignMutation.mutateAsync({ id: campaignId });
        await campaignsQuery.refetch();
      } catch (error) {
        console.error('Error deleting campaign:', error);
        alert('Failed to delete campaign. Please try again.');
      }
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getCopyStyleIcon = (style: string) => {
    switch (style) {
      case 'facts':
        return '📊';
      case 'humour':
        return '😄';
      case 'smart':
        return '🧠';
      case 'emotional':
        return '💝';
      case 'professional':
        return '💼';
      default:
        return '📝';
    }
  };

  const getMediaTypeIcon = (type: string) => {
    switch (type) {
      case 'google-ads':
        return '🔍';
      case 'linkedin':
        return '💼';
      case 'email':
        return '📧';
      case 'print':
        return '📰';
      case 'social-media':
        return '📱';
      default:
        return '📢';
    }
  };

  if (campaignsQuery.isLoading) {
    return (
      <Card className='max-w-4xl mx-auto'>
        <CardHeader>
          <CardTitle>Loading Campaigns...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-center py-8'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (campaignsQuery.error) {
    return (
      <Card className='max-w-4xl mx-auto'>
        <CardHeader>
          <CardTitle>Error Loading Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-red-600'>
            Failed to load campaigns: {campaignsQuery.error.message}
          </p>
        </CardContent>
      </Card>
    );
  }

  const campaigns = campaignsQuery.data || [];

  if (campaigns.length === 0) {
    return (
      <Card className='max-w-4xl mx-auto'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Target className='h-5 w-5 text-muted-foreground' />
            No Campaigns Yet
          </CardTitle>
          <CardDescription>
            You haven&apos;t generated any campaigns for {companyName} yet.
            Create your first campaign above.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='text-center py-8'>
            <div className='text-6xl mb-4'>🎯</div>
            <p className='text-muted-foreground'>
              Start by creating your first campaign using the form above.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-6'>
      <Card className='max-w-4xl mx-auto'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Target className='h-5 w-5 text-primary' />
            Campaign Library
          </CardTitle>
          <CardDescription>
            {campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''} for{' '}
            {companyName}
          </CardDescription>
        </CardHeader>
      </Card>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto'>
        {campaigns.map((campaign: StoredCampaign) => (
          <Card key={campaign.id} className='hover:shadow-lg transition-shadow'>
            <CardHeader className='pb-3'>
              <div className='flex items-start justify-between'>
                <div className='flex-1 min-w-0'>
                  <CardTitle className='text-lg truncate' title={campaign.name}>
                    {campaign.name}
                  </CardTitle>
                  <div className='flex items-center gap-2 mt-2'>
                    <Calendar className='h-4 w-4 text-muted-foreground' />
                    <span className='text-sm text-muted-foreground'>
                      {formatDate(campaign.created_at)}
                    </span>
                  </div>
                </div>
                <div className='flex gap-1'>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => onViewCampaign(campaign)}
                    title='View Campaign'>
                    <Eye className='h-4 w-4' />
                  </Button>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => onEditCampaign(campaign)}
                    title='Edit Campaign'>
                    <Edit className='h-4 w-4' />
                  </Button>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => handleDeleteCampaign(campaign.id)}
                    title='Delete Campaign'
                    className='text-red-600 hover:text-red-700'>
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className='pt-0'>
              <div className='space-y-3'>
                <div className='flex items-center gap-2'>
                  <span className='text-sm font-medium'>Style:</span>
                  <Badge variant='secondary' className='text-xs'>
                    {getCopyStyleIcon(campaign.copy_style)}{' '}
                    {campaign.copy_style}
                  </Badge>
                </div>
                <div className='flex items-center gap-2'>
                  <span className='text-sm font-medium'>Media:</span>
                  <Badge variant='outline' className='text-xs'>
                    {getMediaTypeIcon(campaign.media_type)}{' '}
                    {campaign.media_type}
                  </Badge>
                </div>
                <div className='text-sm text-muted-foreground line-clamp-3'>
                  {campaign.ad_copy.substring(0, 120)}
                  {campaign.ad_copy.length > 120 ? '...' : ''}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
