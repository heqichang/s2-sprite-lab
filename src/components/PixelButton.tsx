import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/utils';

type PixelButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
type PixelButtonSize = 'sm' | 'md' | 'lg';

interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: PixelButtonVariant;
  size?: PixelButtonSize;
  children: ReactNode;
  icon?: ReactNode;
}

const variantClasses: Record<PixelButtonVariant, string> = {
  primary: 'bg-neon-purple/20 text-neon-purple border-neon-purple hover:bg-neon-purple/30 hover:shadow-neon-purple',
  secondary: 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan hover:bg-neon-cyan/30 hover:shadow-neon-cyan',
  danger: 'bg-red-500/20 text-red-400 border-red-500 hover:bg-red-500/30',
  success: 'bg-neon-green/20 text-neon-green border-neon-green hover:bg-neon-green/30',
  warning: 'bg-neon-amber/20 text-neon-amber border-neon-amber hover:bg-neon-amber/30',
};

const sizeClasses: Record<PixelButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-8 py-3 text-base',
};

export function PixelButton({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  className,
  disabled,
  ...props
}: PixelButtonProps) {
  return (
    <button
      className={cn(
        'font-mono font-semibold uppercase tracking-wider border-2',
        'transition-all duration-200 ease-out',
        'hover:scale-[1.02] active:scale-[0.98]',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none',
        'rounded-sm',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      <span className="flex items-center justify-center gap-2">
        {icon}
        {children}
      </span>
    </button>
  );
}
