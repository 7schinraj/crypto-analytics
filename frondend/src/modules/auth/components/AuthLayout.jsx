import styles from './AuthLayout.module.css';
import authHero from '../../../assets/auth_hero.png';
import { ENV } from '../../../config/env.js';

const AuthLayout = ({ children, headline, sub, stats = [] }) => {
  return (
    <div className={styles.page}>
      {/* ── Left panel ─────────────────────────── */}
      <aside className={styles.panel}>
        <div className={styles.panelOverlay} />
        <img
          src={authHero}
          alt="Crypto trading dashboard"
          className={styles.heroImg}
        />

        {/* Brand badge */}
        <header className={styles.brand}>
          <div className={styles.brandIcon}>₿</div>
          <span className={styles.brandName}>{ENV.APP_NAME}</span>
        </header>

        {/* Hero copy */}
        <div className={styles.heroContent}>
          <h1 className={styles.heroHeadline}>{headline}</h1>
          <p  className={styles.heroSub}>{sub}</p>

          {/* Stat pills */}
          {stats.length > 0 && (
            <div className={styles.stats}>
              {stats.map((s) => (
                <div key={s.label} className={styles.statPill}>
                  <span className={styles.statValue}>{s.value}</span>
                  <span className={styles.statLabel}>{s.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Trust badges */}
        <footer className={styles.trust}>
          <div className={styles.trustBadge}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Bank-grade security
          </div>
          <div className={styles.trustBadge}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Real-time data
          </div>
        </footer>
      </aside>

      {/* ── Right panel ────────────────────────── */}
      <main className={styles.formPanel}>
        {children}
      </main>
    </div>
  );
};

export default AuthLayout;
