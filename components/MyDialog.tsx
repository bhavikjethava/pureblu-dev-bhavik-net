import React, { ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import { usePathname } from 'next/navigation';
import ROUTES, { getBaseUrl } from '@/utils/utils';

interface ButtonConfig {
  text: string;
  variant: string;
  size: 'default' | 'sm' | 'xs' | 'lg' | 'icon' | null | undefined;
  onClick?: () => void;
  icon?: ReactNode;
  btnLoading?: boolean;
  className?: string;
  disabled?: boolean;
}

interface MyDialogProps {
  open: boolean;
  isShowClose?: boolean;
  onClose?: () => void;
  title?: string;
  buttons?: ButtonConfig[];
  ClassName?: string;
  children?: ReactNode;
  onInteractOutside?: (e: any) => void;
}

const MyDialog: React.FC<MyDialogProps> = ({
  open,
  onClose,
  buttons = [],
  children,
  title = '',
  isShowClose = true,
  ClassName = 'sm:max-w-lg', // Default dialog size class
  onInteractOutside,
}) => {
  const pathName = usePathname();
  const basePath = getBaseUrl(pathName);
  const isPBPartner = true; //basePath == ROUTES.PBPARTNER;

  return (
    <Dialog open={open} onOpenChange={onClose} modal={false}>
      <div className={` inset-0 z-30 flex items-center justify-center bg-black bg-opacity-50 ${open ? 'fixed' : 'hidden' }`}></div>
      <DialogContent
        className={`flex flex-col gap-0 border-none bg-white p-0  ${ClassName}`}
        onInteractOutside={onInteractOutside}
      >
        <DialogHeader
          className={`${
            isPBPartner ? 'bg-pbHeaderBlue' : 'bg-pbHeaderRed'
          } rounded-tl-lg rounded-tr-lg px-4 py-5 text-primary-foreground`}
        >
          <DialogTitle className='font-medium'>{title}</DialogTitle>
        </DialogHeader>
        {children}
        <DialogFooter className='mt-auto border-t p-4'>
          {buttons.map((button, index) => (
            <Button
              key={index}
              type='button'
              variant={'blue'}
              size={button?.size}
              onClick={button.onClick}
              icon={button.icon}
              disabled={button?.btnLoading || button.disabled}
              className={button?.className}
            >
              {button.text}
            </Button>
          ))}
          {isShowClose && (
            <DialogClose asChild>
              <Button type='button' variant='yellow' size={'xs'}>
                Close
              </Button>
            </DialogClose>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MyDialog;
