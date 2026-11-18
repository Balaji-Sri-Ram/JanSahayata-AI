import React, { useRef, useEffect } from 'react';

/**
 * Interactive segmented OTP input component.
 *
 * Supports:
 * - Configurable length (e.g. 4 or 6 digits)
 * - Auto-focus on first empty box
 * - Auto-advance focus on typing
 * - Smart backspace (deletes current or moves back & clears previous)
 * - Left/Right arrow key navigation
 * - Full paste handling (paste 4 or 6 digit code anywhere)
 * - Mobile numeric keypad support (inputMode="numeric")
 * - Crisp, accessible government portal visual styling
 *
 * @param {Object} props
 * @param {number} [props.length=6] Number of digits (e.g. 4 or 6)
 * @param {string} props.value Current OTP string value
 * @param {Function} props.onChange Callback with the updated OTP string
 * @param {Function} [props.onComplete] Callback when all digits are filled
 * @param {boolean} [props.autoFocus=true] Whether to auto-focus on mount
 * @param {boolean} [props.disabled=false] Whether inputs are disabled
 * @param {boolean} [props.hasError=false] Error styling flag
 * @param {string} [props.className=''] Extra container class
 */
export default function OtpInput({
  length = 6,
  value = '',
  onChange,
  onComplete,
  autoFocus = true,
  disabled = false,
  hasError = false,
  className = ''
}) {
  const inputRefs = useRef([]);

  // Ensure digits array always matches requested length
  const digits = Array.from({ length }, (_, i) => value[i] || '');

  // Auto focus first empty input on mount (if enabled)
  useEffect(() => {
    if (autoFocus && !disabled) {
      const firstEmptyIndex = digits.findIndex(d => !d);
      const targetIndex = firstEmptyIndex === -1 ? length - 1 : firstEmptyIndex;
      inputRefs.current[targetIndex]?.focus();
    }
  }, []);

  const triggerChange = (newDigits) => {
    const combined = newDigits.join('');
    if (onChange) {
      onChange(combined);
    }
    if (combined.length === length && onComplete) {
      onComplete(combined);
    }
  };

  const handleChange = (e, index) => {
    if (disabled) return;
    const rawVal = e.target.value.replace(/\D/g, '');

    // Handle single digit input
    if (rawVal.length > 0) {
      // Take the last character entered
      const char = rawVal[rawVal.length - 1];
      const newDigits = [...digits];
      newDigits[index] = char;
      triggerChange(newDigits);

      // Advance to next box if available
      if (index < length - 1) {
        inputRefs.current[index + 1]?.focus();
        inputRefs.current[index + 1]?.select();
      }
    } else {
      // Character cleared
      const newDigits = [...digits];
      newDigits[index] = '';
      triggerChange(newDigits);
    }
  };

  const handleKeyDown = (e, index) => {
    if (disabled) return;

    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // Current box is empty, jump to previous and clear it
        e.preventDefault();
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        triggerChange(newDigits);
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
        inputRefs.current[index - 1]?.select();
      }
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (index < length - 1) {
        inputRefs.current[index + 1]?.focus();
        inputRefs.current[index + 1]?.select();
      }
    } else if (e.key === 'Delete') {
      e.preventDefault();
      const newDigits = [...digits];
      newDigits[index] = '';
      triggerChange(newDigits);
    }
  };

  const handlePaste = (e) => {
    if (disabled) return;
    e.preventDefault();
    const pasted = (e.clipboardData || window.clipboardData).getData('text') || '';
    const numericOnly = pasted.replace(/\D/g, '').slice(0, length);
    if (!numericOnly) return;

    const newDigits = Array.from({ length }, (_, i) => numericOnly[i] || '');
    triggerChange(newDigits);

    // Focus the next empty index or the last box
    const nextEmpty = newDigits.findIndex(d => !d);
    const targetIdx = nextEmpty === -1 ? length - 1 : nextEmpty;
    inputRefs.current[targetIdx]?.focus();
    inputRefs.current[targetIdx]?.select();
  };

  return (
    <div
      className={`flex items-center justify-center gap-2 sm:gap-2.5 ${className}`}
      onPaste={handlePaste}
    >
      {Array.from({ length }).map((_, index) => {
        const isFilled = Boolean(digits[index]);
        // Responsive sizes: slightly larger if 4 digits, compact and perfect if 6 digits
        const boxSize = length === 4
          ? 'w-12 h-14 sm:w-14 sm:h-16 text-2xl sm:text-3xl'
          : 'w-10 h-12 sm:w-12 sm:h-14 text-xl sm:text-2xl';

        return (
          <React.Fragment key={index}>
            <input
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete={index === 0 ? 'one-time-code' : 'off'}
              maxLength={1}
              value={digits[index]}
              disabled={disabled}
              aria-label={`Digit ${index + 1} of ${length}`}
              onFocus={(e) => e.target.select()}
              onClick={(e) => e.target.select()}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`
                ${boxSize}
                font-mono font-bold text-center select-none
                rounded-xl border-2 transition-all duration-150
                outline-none
                ${
                  hasError
                    ? 'border-red-400 bg-red-50/30 text-red-700 focus:border-red-600 focus:ring-4 focus:ring-red-100'
                    : isFilled
                    ? 'border-[#0b2545] bg-blue-50/20 text-[#0b2545] shadow-xs'
                    : 'border-slate-300 bg-white text-slate-800 hover:border-slate-400'
                }
                focus:border-[#0b2545] focus:ring-4 focus:ring-blue-100/70 focus:bg-white
                disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-100
              `}
            />

            {/* If 6 digits, add a subtle separator in the middle for readability */}
            {length === 6 && index === 2 && (
              <span className="text-slate-300 font-bold select-none px-0.5 sm:px-1 text-sm sm:text-base">
                –
              </span>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
