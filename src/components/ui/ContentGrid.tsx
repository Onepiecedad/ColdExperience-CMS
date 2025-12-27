import React, { ReactNode } from 'react';

interface ContentGridProps {
    columns?: 1 | 2 | 3;
    children: ReactNode;
    gap?: 'sm' | 'md' | 'lg';
}

export const ContentGrid: React.FC<ContentGridProps> = ({
    columns = 2,
    children,
    gap = 'md',
}) => {
    const gapClasses = {
        sm: 'gap-4',
        md: 'gap-5',
        lg: 'gap-6',
    };

    const columnClasses = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    };

    return (
        <div className={`grid ${columnClasses[columns]} ${gapClasses[gap]}`}>
            {children}
        </div>
    );
};

interface ContentFieldProps {
    label: string;
    hint?: string;
    children: ReactNode;
}

export const ContentField: React.FC<ContentFieldProps> = ({
    label,
    hint,
    children,
}) => {
    return (
        <div className="space-y-2.5">
            <div>
                <label className="block text-sm font-medium text-cold-200 mb-1">
                    {label}
                </label>
                {hint && (
                    <p className="text-xs text-cold-500 leading-relaxed">{hint}</p>
                )}
            </div>
            {children}
        </div>
    );
};

interface ContentCardProps {
    title: string;
    subtitle?: string;
    children: ReactNode;
    className?: string;
}

export const ContentCard: React.FC<ContentCardProps> = ({
    title,
    subtitle,
    children,
    className = '',
}) => {
    return (
        <div className={`
            p-5 rounded-xl 
            bg-gradient-to-b from-cold-800/60 to-cold-800/30
            border border-cold-700/30
            backdrop-blur-sm
            transition-all duration-300
            hover:border-cold-600/40 hover:from-cold-800/70
            ${className}
        `}>
            <div className="mb-4">
                <h4 className="font-medium text-cold-100">{title}</h4>
                {subtitle && (
                    <p className="text-xs text-cold-500 mt-1 truncate">{subtitle}</p>
                )}
            </div>
            <div className="space-y-4">
                {children}
            </div>
        </div>
    );
};

export default ContentGrid;
