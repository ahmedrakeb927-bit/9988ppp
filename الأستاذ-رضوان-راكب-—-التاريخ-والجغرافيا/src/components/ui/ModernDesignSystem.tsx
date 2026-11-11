import React from 'react';
import { AlertCircle, CheckCircle2, Inbox, X } from 'lucide-react';

export const DESIGN_TOKENS = {
  primary: '#101C2C',
  secondary: '#B99A62',
  background: '#F7F5EF',
  surface: '#FFFFFF',
  textMain: '#101C2C',
  textSecondary: '#252B33',
  border: '#E5E0D4',
  softAccent: '#F7F5EF',
} as const;

export function ModernCard({
  children,
  className = '',
  interactive = false,
  onClick,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & {
  interactive?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-[#FFFFFF] border border-[#E5E0D4] rounded-xl shadow-[0_1px_2px_rgba(16,28,44,0.03)] ${
        interactive
          ? 'hover:border-[#B99A62] hover:shadow-[0_4px_12px_-2px_rgba(16,28,44,0.08)] transition-all duration-150 cursor-pointer'
          : ''
      } ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export function ModernButton({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'soft' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}) {
  const variantClasses = {
    primary:
      'bg-[#101C2C] text-[#F7F5EF] hover:bg-[#1B2D45] shadow-xs border border-[#101C2C]',
    secondary:
      'bg-[#FFFFFF] text-[#101C2C] border border-[#E5E0D4] hover:bg-[#F7F5EF] hover:border-[#B99A62]',
    soft:
      'bg-[#F7F5EF] text-[#101C2C] border border-[#B99A62]/35 hover:border-[#B99A62]',
    ghost:
      'bg-transparent text-[#252B33] hover:text-[#101C2C] hover:bg-[#F7F5EF]',
    danger:
      'bg-white text-[#DC2626] border border-[#FECACA] hover:bg-[#FEF2F2]',
  }[variant];

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded-lg',
    md: 'px-4 py-2 text-sm rounded-lg',
    lg: 'px-5 py-2.5 text-sm rounded-lg',
  }[size];

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50 disabled:pointer-events-none ${variantClasses} ${sizeClasses} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function ModernToast({
  type,
  title,
  message,
  onClose,
}: {
  type: 'error' | 'success';
  title?: string;
  message: string;
  onClose?: () => void;
}) {
  const isError = type === 'error';
  return (
    <div
      role={isError ? 'alert' : 'status'}
      className={`p-4 rounded-xl border flex items-start justify-between gap-3 text-sm bg-[#FFFFFF] shadow-sm ${
        isError ? 'border-[#FECACA] text-[#101C2C]' : 'border-[#BBF7D0] text-[#101C2C]'
      }`}
    >
      <div className="flex items-start gap-3">
        {isError ? (
          <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
        ) : (
          <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
        )}
        <div className="space-y-0.5">
          {title && (
            <p className={`text-xs font-semibold ${isError ? 'text-[#DC2626]' : 'text-[#16A34A]'}`}>
              {title}
            </p>
          )}
          <p className="text-xs text-[#252B33] leading-relaxed">{message}</p>
        </div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-md text-[#252B33] hover:text-[#101C2C] hover:bg-[#F7F5EF] transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

export function ModernEmptyState({
  title,
  description,
  action,
  testId,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  testId?: string;
}) {
  return (
    <div
      data-testid={testId}
      className="bg-[#FFFFFF] border border-[#E5E0D4] rounded-xl p-8 sm:p-10 text-center flex flex-col items-center justify-center space-y-3"
    >
      <div className="w-10 h-10 rounded-lg bg-[#F7F5EF] border border-[#E5E0D4] text-[#B99A62] flex items-center justify-center">
        <Inbox className="w-5 h-5" />
      </div>
      <h3 className="text-sm font-semibold text-[#101C2C]">{title}</h3>
      <p className="text-xs text-[#252B33]/80 max-w-md leading-relaxed">{description}</p>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}

export function ModernSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="bg-[#FFFFFF] border border-[#E5E0D4] rounded-xl p-6 space-y-4">
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="space-y-2 animate-pulse">
          <div className="h-3.5 bg-[#F7F5EF] rounded w-1/3" />
          <div className="h-3 bg-[#F7F5EF]/60 rounded w-3/4" />
        </div>
      ))}
    </div>
  );
}
