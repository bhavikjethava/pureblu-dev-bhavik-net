import { cn } from '@/lib/utils';
import { ReactNode } from 'react';
import { toast } from './ui/use-toast';
type Variant = 'default' | 'destructive' | 'success' | null | undefined;

interface ToastProps {
  variant: Variant;
  message: ReactNode;
  className?: string;
  icon?: ReactNode; // Add this line
}

export const showToast = ({
  variant,
  message,
  className,
  icon,
}: ToastProps) => {
  toast({
    variant: variant,
    className: cn(
      'top-5 sm:right-0 flex fixed md:max-w-[420px] md:top-4 md:right-4 p-4',
      className
    ),
    action: (
      <div className='flex w-full items-center gap-3 text-white'>
        {icon} {/* Render the icon here */}
        {message}
      </div>
    ),
  });
};
