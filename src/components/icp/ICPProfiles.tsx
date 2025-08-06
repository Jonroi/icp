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
  demographics: {
    age: string;
    gender: string;
    location: string;
  };
  psychographics: {
    interests: string[];
    painPoints: string[];
  };
  description: string;
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
                        Real ICP
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-3'>
                    <div>
                      <h4 className='font-medium text-sm'>Demographics</h4>
                      <p className='text-xs text-muted-foreground'>
                        Age: {icp.demographics.age} | Gender:{' '}
                        {icp.demographics.gender} | Location:{' '}
                        {icp.demographics.location}
                      </p>
                    </div>
                    <div>
                      <h4 className='font-medium text-sm'>Interests</h4>
                      <p className='text-xs text-muted-foreground'>
                        {icp.psychographics.interests.join(', ')}
                      </p>
                    </div>
                    <div>
                      <h4 className='font-medium text-sm'>Pain Points</h4>
                      <p className='text-xs text-muted-foreground'>
                        {icp.psychographics.painPoints.join(', ')}
                      </p>
                    </div>
                    <p className='text-sm'>{icp.description}</p>
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
