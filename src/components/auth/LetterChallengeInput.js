import React, { useRef } from 'react';
import { Clock } from 'lucide-react';

// Countdown display shared by the challenge and cooldown timers.
// The ticking itself stays page-local; this only renders the remaining time,
// turning red near expiry.
export function ChallengeTimer({ secondsLeft }) {
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const low = secondsLeft <= 30;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${low ? 'text-red-600' : 'text-[#6E6E73]'}`}>
      <Clock size={13} />
      {mins}:{String(secs).padStart(2, '0')}
    </span>
  );
}

// Presentational 8-letter challenge grid: letter above, single-digit input below.
// Answers are INDEX-keyed (answers[idx]) — duplicate letters must not collide.
export default function LetterChallengeInput({ letters, answers, onChange, disabled }) {
  const inputRefs = useRef([]);

  const handleChange = (idx, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    onChange(idx, value);
    if (value && idx < letters.length - 1) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !answers[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const digits = (e.clipboardData.getData('text') || '').replace(/\D/g, '');
    if (digits.length < letters.length) return;
    e.preventDefault();
    for (let i = 0; i < letters.length; i += 1) {
      onChange(i, digits[i]);
    }
    inputRefs.current[letters.length - 1]?.focus();
  };

  return (
    <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
      {letters.map((letter, idx) => (
        <div key={idx} className="flex flex-col items-center gap-1.5">
          <span className="text-lg font-semibold text-[#1D1D1F]">{letter}</span>
          <input
            ref={(el) => (inputRefs.current[idx] = el)}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            maxLength={1}
            disabled={disabled}
            value={answers[idx] || ''}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            onPaste={handlePaste}
            className="w-10 h-12 text-center text-lg font-semibold bg-white border border-[#D2D2D7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:border-transparent disabled:opacity-50"
          />
        </div>
      ))}
    </div>
  );
}
