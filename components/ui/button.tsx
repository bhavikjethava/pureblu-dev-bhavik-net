import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-secondary',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:
          'border border-primary text-primary bg-white hover:bg-primary hover:text-primary-foreground uppercase font-semibold',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        icon: 'text-secondary-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline h-auto  !min-w-0 !px-0',
        blue: 'bg-blueButton-default text-white active:bg-blueButton-active hover:bg-blueButton-hover',
        yellow:
          'bg-yellowButton-default text-white active:bg-yellowButton-active hover:bg-yellowButton-hover',
        input:
          'flex w-full rounded-md border border-input  px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:bg-[#eeeeee] disabled:opacity-80',
      },
      size: {
        default: 'h-10 px-4 py-2 ',
        sm: 'h-8 rounded-sm px-4 text-xs ',
        xs: 'h-8 rounded-sm px-3 text-xs',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
      color: {
        primary: 'bg-primary',
        secondary: 'bg-secondary',
        success: 'bg-green-500',
        danger: 'border-pbRed text-pbRed hover:bg-pbRed',
        orange: 'border-pbOrange text-pbOrange hover:bg-pbOrange',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  icon?: React.ReactNode;
  color?: any;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, color, asChild = false, icon, ...props },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, color, className }))}
        ref={ref}
        {...props}
      >
        {icon && <span className='mr-2 flex items-center'>{icon}</span>}
        {props.children}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
