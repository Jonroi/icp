import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save } from 'lucide-react';

interface SaveProjectDialogProps {
  isOpen: boolean;
  projectName: string;
  onProjectNameChange: (name: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function SaveProjectDialog({
  isOpen,
  projectName,
  onProjectNameChange,
  onSave,
  onCancel,
}: SaveProjectDialogProps) {
  if (!isOpen) return null;

  return (
    <Card className='border-2 border-primary'>
      <CardHeader>
        <CardTitle>Save Project</CardTitle>
        <CardDescription>
          Give the project a name to save all filled data
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div>
          <Label htmlFor='project-name'>Project name</Label>
          <Input
            id='project-name'
            placeholder='e.g., Customer Segmentation Q1 2024'
            value={projectName}
            onChange={(e) => onProjectNameChange(e.target.value)}
          />
        </div>
        <div className='flex gap-2'>
          <Button onClick={onSave} className='flex-1'>
            <Save className='h-4 w-4 mr-2' />
            Save
          </Button>
          <Button variant='outline' onClick={onCancel} className='flex-1'>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
