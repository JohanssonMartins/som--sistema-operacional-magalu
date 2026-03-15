import React, { useState, useEffect, useRef } from 'react';

interface DebouncedTextareaProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  rows?: number;
  disabled?: boolean;
}

export const DebouncedTextarea = ({
  value,
  onChange,
  onBlur,
  placeholder,
  className,
  rows = 2,
  disabled = false
}: DebouncedTextareaProps) => {
  const [localValue, setLocalValue] = useState(value);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [localValue]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      onChange(newValue);
    }, 500);
  };

  return (
    <textarea
      ref={textareaRef}
      value={localValue}
      onChange={handleChange}
      onBlur={onBlur}
      placeholder={placeholder}
      className={`${className} overflow-hidden resize-none transition-[height] duration-200`}
      rows={rows}
      disabled={disabled}
      style={{ minHeight: `${rows * 1.5}rem` }}
    />
  );
};
