import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ICPPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ICPPopup({ isOpen, onClose }: ICPPopupProps) {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg p-6 max-w-md mx-4 max-h-[80vh] overflow-y-auto'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-xl font-semibold'>What is an ICP?</h2>
          <Button variant='ghost' size='icon' onClick={onClose}>
            <X className='h-4 w-4' />
          </Button>
        </div>
        <div className='space-y-4'>
          <div>
            <h3 className='font-medium mb-2'>Ideal Customer Profile (ICP)</h3>
            <p className='text-sm text-muted-foreground mb-3'>
              An ICP is a detailed description of your perfect customer &mdash;
              the type of person or company that would benefit most from your
              product or service.
            </p>
          </div>

          <div>
            <h4 className='font-medium mb-2'>Why ICPs Matter:</h4>
            <ul className='text-sm text-muted-foreground space-y-1'>
              <li>• Focus your marketing efforts on the right audience</li>
              <li>• Create more effective campaigns and messaging</li>
              <li>• Reduce customer acquisition costs</li>
              <li>• Improve product-market fit</li>
            </ul>
          </div>

          <div>
            <h4 className='font-medium mb-2'>What Our AI Analyzes:</h4>
            <ul className='text-sm text-muted-foreground space-y-1'>
              <li>
                • <strong>Demographics:</strong> Age, location, income,
                education
              </li>
              <li>
                • <strong>Psychographics:</strong> Interests, values, lifestyle,
                pain points
              </li>
              <li>
                • <strong>Behavior:</strong> Online habits, purchasing behavior,
                brand preferences
              </li>
              <li>
                • <strong>Goals &amp; Challenges:</strong> What they want to
                achieve and what&apos;s holding them back
              </li>
            </ul>
          </div>

          <div>
            <h4 className='font-medium mb-2'>How to Use This Tool:</h4>
            <ol className='text-sm text-muted-foreground space-y-1'>
              <li>1. Add your main competitors&apos; websites</li>
              <li>2. Include customer reviews from Google, Trustpilot, etc.</li>
              <li>3. Add any additional context about your market</li>
              <li>4. Click &quot;Generate Ideal Customer Personas&quot;</li>
              <li>5. Use the results to guide your marketing strategy</li>
            </ol>
          </div>

          <div className='pt-4 border-t'>
            <Button onClick={onClose} className='w-full'>
              Got it!
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
