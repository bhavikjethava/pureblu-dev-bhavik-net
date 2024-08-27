import * as React from 'react';

import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  onSubmit?: () => void;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, onSubmit, ...props }, ref) => {
    const onKeyDownHandler = (e: any) => {
      if (e.key === 'Enter') {
        onSubmit?.();
      }
    };
    return (
      <input
        type={type}
        className={cn(
          'flex w-full rounded-md border border-input  px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:border-black focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-[#eeeeee] disabled:opacity-80',
          className
        )}
        ref={ref}
        onKeyUp={onKeyDownHandler}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
