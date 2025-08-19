import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Copy, Download, Save, Edit, Trash2 } from 'lucide-react';
import Image from 'next/image';
import type { StoredCampaign } from '@/services/database';

interface CampaignDisplayProps {
  campaign: StoredCampaign;
  onEdit?: (campaign: StoredCampaign) => void;
  onDelete?: (campaignId: string) => void;
  onSave?: (campaign: StoredCampaign) => void;
}

export function CampaignDisplay({
  campaign,
  onEdit,
  onDelete,
  onSave,
}: CampaignDisplayProps) {
  const hooks = campaign.hooks.split('|').filter((hook) => hook.trim());

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const handleDownload = () => {
    const campaignData = {
      name: campaign.name,
      adCopy: campaign.ad_copy,
      cta: campaign.cta,
      hooks: campaign.hooks,
      landingPageCopy: campaign.landing_page_copy,
      imagePrompt: campaign.image_prompt,
      mediaType: campaign.media_type,
      copyStyle: campaign.copy_style,
    };

    const blob = new Blob([JSON.stringify(campaignData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${campaign.name.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className='bg-muted/30'>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle>{campaign.name}</CardTitle>
            <CardDescription>
              {campaign.media_type} • {campaign.copy_style} • Created{' '}
              {new Date(campaign.created_at).toLocaleDateString()}
            </CardDescription>
          </div>
          <div className='flex gap-2'>
            {onEdit && (
              <Button
                variant='outline'
                size='sm'
                onClick={() => onEdit(campaign)}>
                <Edit className='h-4 w-4' />
              </Button>
            )}
            {onDelete && (
              <Button
                variant='outline'
                size='sm'
                onClick={() => onDelete(campaign.id)}>
                <Trash2 className='h-4 w-4' />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className='space-y-6'>
        {/* Ad Copy Section */}
        <div className='space-y-2'>
          <h4 className='font-semibold flex items-center justify-between'>
            Ad Copy
            <Button
              variant='ghost'
              size='sm'
              onClick={() => handleCopy(campaign.ad_copy)}>
              <Copy className='h-4 w-4' />
            </Button>
          </h4>
          <p className='text-sm bg-background p-3 rounded-md border'>
            {campaign.ad_copy}
          </p>
        </div>

        {/* Call to Action */}
        <div className='space-y-2'>
          <h4 className='font-semibold flex items-center justify-between'>
            Call to Action
            <Button
              variant='ghost'
              size='sm'
              onClick={() => handleCopy(campaign.cta)}>
              <Copy className='h-4 w-4' />
            </Button>
          </h4>
          <p className='text-sm bg-background p-3 rounded-md border font-medium'>
            {campaign.cta}
          </p>
        </div>

        {/* Landing Page Hooks */}
        <div className='space-y-2'>
          <h4 className='font-semibold'>Landing Page Hooks</h4>
          <div className='space-y-2'>
            {hooks.map((hook, index) => (
              <div
                key={index}
                className='flex items-center justify-between bg-background p-3 rounded-md border'>
                <p className='text-sm'>{hook}</p>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => handleCopy(hook)}>
                  <Copy className='h-4 w-4' />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Landing Page Copy */}
        <div className='space-y-2'>
          <h4 className='font-semibold flex items-center justify-between'>
            Landing Page Copy
            <Button
              variant='ghost'
              size='sm'
              onClick={() => handleCopy(campaign.landing_page_copy)}>
              <Copy className='h-4 w-4' />
            </Button>
          </h4>
          <p className='text-sm bg-background p-3 rounded-md border'>
            {campaign.landing_page_copy}
          </p>
        </div>

        {/* Image Section */}
        {campaign.image_prompt && (
          <div className='space-y-2'>
            <h4 className='font-semibold'>Image Suggestion</h4>
            <div className='flex items-center gap-4'>
              <Image
                src={`https://placehold.co/200x120.png`}
                alt='Generated Ad'
                width={200}
                height={120}
                className='rounded-md'
                unoptimized
              />
              <p className='text-sm flex-1'>{campaign.image_prompt}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className='flex justify-end gap-2 pt-4 border-t'>
          <Button variant='outline' onClick={handleDownload}>
            <Download className='mr-2 h-4 w-4' />
            Download
          </Button>
          {onSave && (
            <Button onClick={() => onSave(campaign)}>
              <Save className='mr-2 h-4 w-4' />
              Save to Platform
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
