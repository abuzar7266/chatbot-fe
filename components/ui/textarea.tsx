import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  size?: 'sm' | 'md' | 'lg';
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, size = 'md', rows = 3, ...props }, ref) => {
    const baseStyles =
      'flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50';

    const sizes = {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
    } as const;

    return (
      <textarea
        className={cn(baseStyles, sizes[size], className)}
        ref={ref}
        rows={rows}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;

