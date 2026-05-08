import React from 'react';
import styles from './Alert.module.css';

const Alert = ({ type = 'error', message, id }) => {
  if (!message) return null;

  const Icon = () => {
    if (type === 'error') {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      );
    }
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    );
  };

  return (
    <div className={`${styles.alert} ${styles[type]}`} role="alert" id={id}>
      <Icon />
      <span>{message}</span>
    </div>
  );
};

export default Alert;
