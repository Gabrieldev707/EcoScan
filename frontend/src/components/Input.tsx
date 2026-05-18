import React, { useRef, useState } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
  rightSlot?: React.ReactNode;
}

export function Input({ label, error, icon, rightSlot, id, value, onChange, ...rest }: InputProps) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const floating = focused || !!value || !!rest.defaultValue;

  return (
    <div className={`eco-input__wrap ${error ? 'eco-input__wrap--error' : ''}`}>
      <div
        className={`eco-input__field ${focused ? 'eco-input__field--focused' : ''}`}
        onClick={() => inputRef.current?.focus()}
      >
        {icon && <span className="eco-input__icon">{icon}</span>}
        <div className="eco-input__inner">
          <label
            htmlFor={id}
            className={`eco-input__label ${floating ? 'eco-input__label--float' : ''}`}
          >
            {label}
          </label>
          <input
            ref={inputRef}
            id={id}
            value={value}
            onChange={onChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="eco-input__control"
            {...rest}
          />
        </div>
        {rightSlot && <span className="eco-input__right">{rightSlot}</span>}
      </div>
      {error && <p className="eco-input__error">{error}</p>}
    </div>
  );
}
