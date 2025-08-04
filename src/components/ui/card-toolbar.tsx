import { Button } from './button';
import { HelpCircle } from 'lucide-react';

interface CardToolbarProps {
  tooltip?: string;
  questions?: string[];
}

export function CardToolbar({ tooltip, questions }: CardToolbarProps) {
  return (
    <div className='flex items-center gap-2'>
      {tooltip && (
        <Button variant='ghost' size='icon' className='h-8 w-8' title={tooltip}>
          <HelpCircle className='h-4 w-4' />
        </Button>
      )}
      {questions && questions.length > 0 && (
        <div className='flex gap-1'>
          {questions.map((question, index) => (
            <Button key={index} variant='outline' size='sm' className='text-xs'>
              {question}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
