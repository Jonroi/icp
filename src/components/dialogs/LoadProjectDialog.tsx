import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Trash2, Upload } from 'lucide-react';

interface LoadProjectDialogProps {
  isOpen: boolean;
  savedProjects: string[];
  onLoadProject: (name: string) => void;
  onDeleteProject: (name: string) => void;
  onCancel: () => void;
}

export function LoadProjectDialog({
  isOpen,
  savedProjects,
  onLoadProject,
  onDeleteProject,
  onCancel,
}: LoadProjectDialogProps) {
  if (!isOpen || savedProjects.length === 0) return null;

  return (
    <Card className='border-2 border-primary'>
      <CardHeader>
        <CardTitle>Load Project</CardTitle>
        <CardDescription>
          Select a saved project to load all data
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-3'>
        {savedProjects.map((name) => (
          <div
            key={name}
            className='flex items-center justify-between p-3 border rounded'>
            <span className='font-medium'>{name}</span>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => onLoadProject(name)}>
                <Upload className='h-4 w-4 mr-1' />
                Load
              </Button>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => onDeleteProject(name)}>
                <Trash2 className='h-4 w-4' />
              </Button>
            </div>
          </div>
        ))}
        <Button variant='outline' onClick={onCancel} className='w-full'>
          Close
        </Button>
      </CardContent>
    </Card>
  );
}
