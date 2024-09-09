import React, { ReactNode } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from './ui/button';

interface ButtonConfig {
  text: string;
  variant:
    | 'link'
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'blue'
    | 'yellow'
    | null
    | undefined;
  size: string;
  onClick?: (newData: any) => void;
  icon?: ReactNode;
  btnLoading?: boolean;
  disabled?: boolean;
}

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose?: () => void;
  buttons?: ButtonConfig[];
  ClassName?: string;
  children?: ReactNode;
  content?: string;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  buttons = [],
  children,
  content,
  ClassName = 'sm:max-w-lg', // Default dialog size class
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className={`${ClassName}`}>
        <AlertDialogHeader>
          <AlertDialogTitle className='text-center'>
            {' '}
            {children}
          </AlertDialogTitle>
          {content && (
            <AlertDialogDescription>{content}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter className='sm:justify-center'>
          {buttons.map((button, index) => (
            <Button
              key={index}
              type='button'
              variant={button.variant}
              onClick={button.onClick}
              icon={button.icon}
              disabled={button?.btnLoading || button?.disabled}
              className='min-w-[100px]'
            >
              {button.text}
            </Button>
          ))}
          <Button
            type='button'
            variant='yellow'
            onClick={onClose}
            className='min-w-[100px]'
          >
            Cancel
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmationDialog;
