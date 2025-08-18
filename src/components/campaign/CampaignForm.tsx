import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Bot, ImageIcon } from 'lucide-react';
import type { CopyStyle, MediaType } from '@/services/ai/types';

interface CampaignFormProps {
  icpOptions: Array<{ id: string; name: string }>;
  onSubmit: (data: CampaignFormData) => void;
  isLoading?: boolean;
}

export interface CampaignFormData {
  icpId: string;
  copyStyle: CopyStyle;
  mediaType: MediaType;
  imagePrompt?: string;
  campaignDetails?: string;
}

export function CampaignForm({
  icpOptions,
  onSubmit,
  isLoading = false,
}: CampaignFormProps) {
  const [formData, setFormData] = useState<CampaignFormData>({
    icpId: '',
    copyStyle: 'facts',
    mediaType: 'google-ads',
    imagePrompt: '',
    campaignDetails: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.icpId) {
      onSubmit(formData);
    }
  };

  const handleChange = (field: keyof CampaignFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div className='space-y-2'>
        <Label>Ideal Customer Persona (ICP)</Label>
        <Select
          value={formData.icpId}
          onValueChange={(value) => handleChange('icpId', value)}>
          <SelectTrigger>
            <SelectValue placeholder='Select an ICP' />
          </SelectTrigger>
          <SelectContent>
            {icpOptions.map((icp) => (
              <SelectItem key={icp.id} value={icp.id}>
                {icp.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className='space-y-2'>
        <Label>Copy Style</Label>
        <Select
          value={formData.copyStyle}
          onValueChange={(value) =>
            handleChange('copyStyle', value as CopyStyle)
          }>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='facts'>Facts</SelectItem>
            <SelectItem value='humour'>British Humour</SelectItem>
            <SelectItem value='smart'>Smart</SelectItem>
            <SelectItem value='emotional'>Emotional</SelectItem>
            <SelectItem value='professional'>Professional</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className='space-y-2'>
        <Label>Ad Media</Label>
        <Select
          value={formData.mediaType}
          onValueChange={(value) =>
            handleChange('mediaType', value as MediaType)
          }>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='google-ads'>Google Ads</SelectItem>
            <SelectItem value='linkedin'>LinkedIn</SelectItem>
            <SelectItem value='email'>Email</SelectItem>
            <SelectItem value='print'>Print</SelectItem>
            <SelectItem value='social-media'>Social Media</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className='space-y-2'>
        <Label>Image (Optional)</Label>
        <Input
          placeholder='Describe the image you want the AI to generate...'
          value={formData.imagePrompt}
          onChange={(e) => handleChange('imagePrompt', e.target.value)}
        />
        <Button type='button' variant='outline' className='w-full'>
          <ImageIcon className='mr-2 h-4 w-4' />
          Select from Library
        </Button>
      </div>

      <div className='space-y-2'>
        <Label>Campaign Details (Optional)</Label>
        <Textarea
          placeholder='e.g., Launching a new feature for analytics...'
          value={formData.campaignDetails}
          onChange={(e) => handleChange('campaignDetails', e.target.value)}
        />
      </div>

      <Button
        type='submit'
        className='w-full'
        disabled={!formData.icpId || isLoading}>
        <Bot className='mr-2 h-4 w-4' />
        {isLoading ? 'Generating Campaign...' : 'Generate Campaign'}
      </Button>
    </form>
  );
}
