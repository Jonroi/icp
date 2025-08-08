import { Button } from '@/components/ui/button';
import { Save, Upload } from 'lucide-react';

interface HeaderProps {
  savedProjectsCount: number;
  onSaveProject: () => void;
  onLoadProject: () => void;
}

export function Header({
  savedProjectsCount,
  onSaveProject,
  onLoadProject,
}: HeaderProps) {
  return (
    <div className='flex items-center justify-between'>
      <div>
        <h1 className='text-3xl font-bold font-headline tracking-tight'>
          ICP &amp; Campaign Insights
        </h1>
        <p className='text-muted-foreground'>
          Generate customer profiles and design winning campaigns with AI.
        </p>
      </div>
      <div className='flex gap-2'>
        <Button variant='outline' onClick={onSaveProject}>
          <Save className='h-4 w-4 mr-2' />
          Save Project
        </Button>
        <Button variant='outline' onClick={onLoadProject}>
          <Upload className='h-4 w-4 mr-2' />
          Load Project ({savedProjectsCount})
        </Button>
      </div>
    </div>
  );
}
