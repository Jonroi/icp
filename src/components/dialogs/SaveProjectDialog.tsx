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
        <CardTitle>Tallenna Projekti</CardTitle>
        <CardDescription>
          Anna projektille nimi tallentaaksesi kaikki täytetyt tiedot
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div>
          <Label htmlFor='project-name'>Projektin nimi</Label>
          <Input
            id='project-name'
            placeholder='Esim. Asiakassegmentointi Q1 2024'
            value={projectName}
            onChange={(e) => onProjectNameChange(e.target.value)}
          />
        </div>
        <div className='flex gap-2'>
          <Button onClick={onSave} className='flex-1'>
            <Save className='h-4 w-4 mr-2' />
            Tallenna
          </Button>
          <Button variant='outline' onClick={onCancel} className='flex-1'>
            Peruuta
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
