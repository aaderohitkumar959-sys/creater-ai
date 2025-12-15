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
        <div className="overflow-x-auto hide-scrollbar mb-6">
            <div className="flex gap-2 px-4">
                {categories.map((category) => {
                    const isActive = activeCategory === category;

                    return (
                        <button
                            key={category}
                            onClick={() => onCategoryChange(category)}
                            className={cn(
                                'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap',
                                'transition-all duration-250',
                                'touch-target',
                                isActive && 'bg-gradient-accent text-white shadow-glow',
                                !isActive && 'glass-light text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5'
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
