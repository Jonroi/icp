import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

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
import { Bot, Copy, Download, ImageIcon, Save } from 'lucide-react';
// AI assistant removed during reset

interface GeneratedCampaign {
  adCopy: string;
  image: string;
  imageHint: string;
  cta: string;
  hooks: string;
  landingPageCopy: string;
}

interface CampaignDesignerProps {
  // Simplified props - no external dependencies
}

export function CampaignDesigner({}: CampaignDesignerProps) {
  return (
    <Card className='mt-4 max-w-4xl mx-auto'>
      <CardHeader className='flex-col space-y-4 sm:flex-row sm:items-start sm:justify-between'>
        <div>
          <CardTitle className='flex items-center gap-2'>
            <Bot className='h-5 w-5 text-primary' />
            Campaign Designer
          </CardTitle>
          <CardDescription>
            Generate a full campaign based on your ICP.
          </CardDescription>
        </div>
        <Button size='sm' className='flex items-center gap-2' disabled>
          Create Campaign (coming soon)
        </Button>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='space-y-2'>
          <Label>Ideal Customer Persona (ICP)</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder='Select an ICP' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='icp1'>ICP 1: SME Owners</SelectItem>
              <SelectItem value='icp2'>ICP 2: Marketing Managers</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className='space-y-2'>
          <Label>Copy Style</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder='Select a copy style' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='facts'>Facts</SelectItem>
              <SelectItem value='humour'>British Humour</SelectItem>
              <SelectItem value='smart'>Smart</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className='space-y-2'>
          <Label>Ad Media</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder='Select media type' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='google-ads'>Google Ads</SelectItem>
              <SelectItem value='linkedin'>LinkedIn</SelectItem>
              <SelectItem value='email'>Email</SelectItem>
              <SelectItem value='print'>Print</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className='space-y-2'>
          <Label>Image (Optional)</Label>
          <Input
            id='image-prompt'
            placeholder='Describe the image you want the AI to generate...'
          />
          <Button variant='outline' className='w-full'>
            <ImageIcon className='mr-2 h-4 w-4' />
            Select from Library
          </Button>
        </div>
        <div className='space-y-2'>
          <Label>Campaign Details (Optional)</Label>
          <Textarea placeholder='e.g., Launching a new feature for analytics...' />
        </div>
        <Button
          className='w-full'
          onClick={() => alert('Campaign generation coming soon!')}>
          <Bot className='mr-2 h-4 w-4' />
          Generate Campaign
        </Button>
      </CardContent>
    </Card>
  );
}
