import React from 'react';
import styles from './Input.module.css';

const Input = ({ 
  label, 
  id, 
  name, 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  error, 
  icon, 
  rightElement,
  autoComplete,
  ariaDescribedby
}) => {
  return (
    <div className={styles.field}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      )}
      <div className={styles.inputWrapper}>
        {icon && <div className={styles.icon}>{icon}</div>}
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`${styles.input} ${error ? styles.inputError : ''} ${icon ? styles.withIcon : ''}`}
          aria-describedby={ariaDescribedby}
        />
        {rightElement && (
          <div className={styles.rightElement}>
            {rightElement}
          </div>
        )}
      </div>
      {error && (
        <p id={ariaDescribedby} className={styles.errorMsg}>
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
