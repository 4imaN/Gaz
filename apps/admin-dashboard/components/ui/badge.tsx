import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva('inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold', { variants: { variant: { default: 'border-teal-200 bg-teal-50 text-teal-800', muted: 'border-stone-200 bg-stone-100 text-stone-600', warning: 'border-amber-200 bg-amber-50 text-amber-800' } }, defaultVariants: { variant: 'default' } });
export function Badge({ className, variant, ...props }: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) { return <div className={cn(badgeVariants({ variant }), className)} {...props} />; }
