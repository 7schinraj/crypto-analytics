import React from 'react';
import styles from './Button.module.css';

const Button = ({ 
  children, 
  type = 'button', 
  variant = 'primary', 
  loading = false, 
  disabled = false, 
  onClick,
  className = '',
  id
}) => {
  return (
    <button
      id={id}
      type={type}
      className={`${styles.button} ${styles[variant]} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? (
        <>
          <span className={styles.spinner} aria-hidden="true" />
          <span>Processing...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
