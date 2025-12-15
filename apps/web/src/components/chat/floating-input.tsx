/**
 * Floating Input Bar Component
 * Smooth, rounded input with send button glow
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingInputProps {
    onSend: (message: string) => void;
    disabled?: boolean;
    placeholder?: string;
}

export const FloatingInput: React.FC<FloatingInputProps> = ({
    onSend,
    disabled = false,
    placeholder = 'Type a message...',
}) => {
    const [message, setMessage] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    }, [message]);

    const handleSend = () => {
        if (message.trim() && !disabled) {
            onSend(message.trim());
            setMessage('');
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="sticky bottom-0 safe-bottom bg-gradient-primary border-t border-[var(--border-medium)] backdrop-blur-xl">
            <div className="container-mobile py-3">
                <div
                    className={cn(
                        'flex items-end gap-2 p-2',
                        'glass-medium rounded-2xl',
                        'border border-[var(--border-medium)]',
                        'transition-all duration-250',
                        'focus-within:border-[var(--accent-blue)]'
                    )}
                >
                    {/* Textarea */}
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        disabled={disabled}
                        rows={1}
                        className={cn(
                            'flex-1 bg-transparent resize-none',
                            'text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
                            'focus:outline-none',
                            'px-3 py-2',
                            'max-h-[120px]',
                            'scrollbar-thin'
                        )}
                        style={{
                            minHeight: '40px',
                        }}
                    />

                    {/* Send Button */}
                    <button
                        onClick={handleSend}
                        disabled={disabled || !message.trim()}
                        className={cn(
                            'flex-shrink-0 p-2.5 rounded-xl',
                            'transition-all duration-250',
                            'touch-target',
                            message.trim() && !disabled
                                ? 'bg-gradient-accent text-white shadow-glow hover:scale-105 active:scale-95'
                                : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] cursor-not-allowed'
                        )}
                        aria-label="Send message"
                    >
                        <Send size={20} />
                    </button>
                </div>

                {/* Helper text */}
                <p className="text-xs text-[var(--text-muted)] mt-2 px-1">
                    Press Enter to send, Shift+Enter for new line
                </p>
            </div>
        </div>
    );
};
