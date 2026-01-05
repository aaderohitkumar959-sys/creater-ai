/**
 * Category Tabs Component
 * Horizontal scrollable tabs for AI personality categories
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface CategoryTabsProps {
    categories: string[];
    activeCategory: string;
    onCategoryChange: (category: string) => void;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
    categories,
    activeCategory,
    onCategoryChange,
}) => {
    return (
        <div className="overflow-x-auto hide-scrollbar mb-6 w-full">
            <div className="flex flex-nowrap gap-3 px-4">
                {categories.map((category) => {
                    const isActive = activeCategory === category;

                    return (
                        <button
                            key={category}
                            onClick={() => onCategoryChange(category)}
                            className={cn(
                                'px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0',
                                'transition-all duration-250 border border-transparent',
                                'touch-target',
                                isActive && 'bg-gradient-accent text-white shadow-glow border-white/10',
                                !isActive && 'glass-light text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5 border-white/5'
                            )}
                        >
                            {category}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
