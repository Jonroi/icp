import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Bot } from 'lucide-react';

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
        <CardTitle className='flex items-center gap-2'>
          <Bot className='h-5 w-5 text-primary' />
          ICP Profiles
        </CardTitle>
        <CardDescription>
          View and manage your generated Ideal Customer Profiles
        </CardDescription>
      </CardHeader>
      <CardContent>
        {generatedICPs.length > 0 ? (
          <div className='space-y-4'>
            <h3 className='font-semibold'>
              Generated ICPs ({generatedICPs.length})
            </h3>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
              {generatedICPs.map((icp, index) => (
                <Card key={index} className='bg-muted/30'>
                  <CardHeader>
                    <CardTitle className='flex items-center justify-between'>
                      {icp.name}
                      <span className='text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded'>
                        AI Generated
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-3'>
                    <div>
                      <h4 className='font-medium text-sm'>Description</h4>
                      <p className='text-xs text-muted-foreground'>
                        {icp.description}
                      </p>
                    </div>
                    <div>
                      <h4 className='font-medium text-sm'>Demographics</h4>
                      <p className='text-xs text-muted-foreground'>
                        Age: {icp.demographics.age} | Gender:{' '}
                        {icp.demographics.gender} | Location:{' '}
                        {icp.demographics.location}
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        Income: {icp.demographics.income} | Education:{' '}
                        {icp.demographics.education}
                      </p>
                    </div>
                    <div>
                      <h4 className='font-medium text-sm'>Interests</h4>
                      <p className='text-xs text-muted-foreground'>
                        {icp.psychographics.interests.join(', ')}
                      </p>
                    </div>
                    <div>
                      <h4 className='font-medium text-sm'>Values</h4>
                      <p className='text-xs text-muted-foreground'>
                        {icp.psychographics.values.join(', ')}
                      </p>
                    </div>
                    <div>
                      <h4 className='font-medium text-sm'>Lifestyle</h4>
                      <p className='text-xs text-muted-foreground'>
                        {icp.psychographics.lifestyle}
                      </p>
                    </div>
                    <div>
                      <h4 className='font-medium text-sm'>Pain Points</h4>
                      <p className='text-xs text-muted-foreground'>
                        {icp.psychographics.painPoints.join(', ')}
                      </p>
                    </div>
                    <div>
                      <h4 className='font-medium text-sm'>Online Habits</h4>
                      <p className='text-xs text-muted-foreground'>
                        {icp.behavior.onlineHabits.join(', ')}
                      </p>
                    </div>
                    <div>
                      <h4 className='font-medium text-sm'>
                        Purchasing Behavior
                      </h4>
                      <p className='text-xs text-muted-foreground'>
                        {icp.behavior.purchasingBehavior}
                      </p>
                    </div>
                    <div>
                      <h4 className='font-medium text-sm'>Brand Preferences</h4>
                      <p className='text-xs text-muted-foreground'>
                        {icp.behavior.brandPreferences.join(', ')}
                      </p>
                    </div>
                    <div>
                      <h4 className='font-medium text-sm'>Goals</h4>
                      <p className='text-xs text-muted-foreground'>
                        {icp.goals.join(', ')}
                      </p>
                    </div>
                    <div>
                      <h4 className='font-medium text-sm'>Challenges</h4>
                      <p className='text-xs text-muted-foreground'>
                        {icp.challenges.join(', ')}
                      </p>
                    </div>
                    <div>
                      <h4 className='font-medium text-sm'>
                        Preferred Channels
                      </h4>
                      <p className='text-xs text-muted-foreground'>
                        {icp.preferredChannels.join(', ')}
                      </p>
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
