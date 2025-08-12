import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Copy, Download, Save } from 'lucide-react';
import { AIAssistantButton } from '@/components/ui/ai-assistant-button';

const campaignIdeas = [
  {
    title: 'SaaS Free Trial Campaign',
    adCopy:
      'Stop guessing. Start converting. SuperSite AI gives you the data to make decisions that drive revenue. Start your free 14-day trial today.',
    hook: 'Unlock the power of your data.',
    imageSuggestion:
      'A clean, modern dashboard showing positive growth charts and key metrics. The style should be professional yet approachable.',
    imageHint: 'data analytics dashboard',
  },
  {
    title: 'E-commerce Flash Sale',
    adCopy:
      "⚡ 48-Hour Flash Sale! ⚡ Get 25% off our entire collection. Limited stock available. Don't miss out on these amazing deals!",
    hook: 'Your next favorite outfit is on sale.',
    imageSuggestion:
      'A dynamic, eye-catching graphic with bold text announcing the flash sale. Use vibrant colors to create a sense of urgency.',
    imageHint: 'flash sale announcement',
  },
  {
    title: 'B2B Lead Generation (Ebook)',
    adCopy:
      'Ready to double your conversion rate? Download our free ebook, "The Ultimate Guide to Website Personalization" and learn the strategies top marketers use.',
    hook: 'Get the secrets to higher conversions.',
    imageSuggestion:
      'A professional-looking cover design for the ebook, perhaps on a tablet or a desk with other business-related items.',
    imageHint: 'ebook cover design',
  },
];

export function CampaignLibrary() {
  return (
    <Card className='mt-4'>
      <CardHeader className='flex-row items-center justify-between'>
        <div>
          <CardTitle>Campaign Idea Library</CardTitle>
          <CardDescription>
            Browse these examples for inspiration. Save them to use in the
            personalization builder.
          </CardDescription>
        </div>
        <AIAssistantButton
          assistantType='campaign-research-tool'
          size='sm'
          className='flex items-center gap-2'>
          Research Campaigns
        </AIAssistantButton>
      </CardHeader>
      <CardContent className='space-y-4'>
        {campaignIdeas.map((idea, index) => (
          <Card key={index} className='bg-muted/30'>
            <CardHeader>
              <CardTitle>{idea.title}</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <h4 className='font-semibold'>Ad Copy</h4>
                <p className='text-sm'>{idea.adCopy}</p>
              </div>
              <div className='space-y-2'>
                <h4 className='font-semibold'>Landing Page Hook</h4>
                <p className='text-sm'>{idea.hook}</p>
              </div>
              <div className='space-y-2'>
                <h4 className='font-semibold'>Image Suggestion</h4>
                <div className='flex items-center gap-4 mt-2'>
                  <img
                    src={`https://placehold.co/200x120.png`}
                    alt='Generated Ad'
                    className='rounded-md'
                    data-ai-hint={idea.imageHint}
                  />
                  <p className='text-sm'>{idea.imageSuggestion}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className='flex justify-end gap-2'>
              <Button variant='outline'>
                <Copy className='mr-2 h-4 w-4' /> Copy
              </Button>
              <Button variant='outline'>
                <Download className='mr-2 h-4 w-4' /> Download
              </Button>
              <Button>
                <Save className='mr-2 h-4 w-4' /> Save to Platform
              </Button>
            </CardFooter>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}
