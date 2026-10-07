import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 disabled:pointer-events-none disabled:opacity-50',
  { variants: { variant: { default: 'bg-teal-700 text-white hover:bg-teal-800', outline: 'border border-stone-300 bg-white text-stone-800 hover:bg-stone-100', ghost: 'text-stone-600 hover:bg-stone-100 hover:text-stone-950' }, size: { default: 'h-9 px-3', sm: 'h-8 px-2.5 text-xs', icon: 'size-9' } }, defaultVariants: { variant: 'default', size: 'default' } },
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> { asChild?: boolean }
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';
  return <Comp className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props} />;
});
Button.displayName = 'Button';
