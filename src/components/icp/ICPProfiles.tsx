import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Bot, Sparkles, Link as LinkIcon, Pencil, Trash2 } from 'lucide-react';
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
}

export function ICPProfiles({ generatedICPs }: ICPProfilesProps) {
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
          <Button size='sm' className='flex items-center gap-2' disabled>
            Analyze ICPs (coming soon)
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {generatedICPs.length > 0 ? (
          <div className='space-y-4'>
            <h3 className='font-semibold'>
              Generated ICPs ({generatedICPs.length})
            </h3>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              {generatedICPs.map((icp, index) => (
                <Card key={index} className='bg-muted/30'>
                  <CardHeader className='pb-3'>
                    <CardTitle className='text-2xl'>ICP: {icp.name}</CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <p className='text-sm text-muted-foreground line-clamp-4'>
                      {icp.description}
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
                        aria-label='Delete'>
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
