import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { DashboardIcon, LibraryIcon, CalendarIcon, NotesIcon, LogoutIcon } from '../../icons';
import logo from '../../../assets/logo.svg';
import styles from './Navbar.module.scss';

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { path: '/library', label: 'Library', icon: <LibraryIcon /> },
    { path: '/calendar', label: 'Calendar', icon: <CalendarIcon /> },
    { path: '/notes', label: 'Notes', icon: <NotesIcon /> }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link to="/dashboard" className={styles.logo}>
          <div className={styles.logoIcon}>
            <img src={logo} className={`${styles.logoImg} img-cover`} alt="logo" />
          </div>
          <span className={styles.logoText}>StudyFlow</span>
        </Link>

        <ul className={styles.navLinks}>
          {navItems.map(item => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`${styles.navLink} ${isActive(item.path) ? styles.active : ''}`}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className={styles.userSection}>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>
              {(currentUser?.displayName?.[0] || currentUser?.email?.[0] || 'U').toUpperCase()}
            </div>
            <span className={styles.userName}>
              {currentUser?.displayName || currentUser?.email?.split('@')[0]}
            </span>
          </div>
          <button onClick={logout} className={styles.logoutButton}>
            <LogoutIcon />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}