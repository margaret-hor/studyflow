import { useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLibrary } from '../../hooks/useLibrary';
import { Link } from 'react-router-dom';
import {
  SavedIcon,
  NotesIcon,
  CalendarIcon,
  TargetIcon,
  TrendingIcon
} from '../../components/icons';
import emptyLibraryIcon from "../../assets/icons/empty_library_icon.svg";
import styles from './Dashboard.module.scss';

export default function Dashboard() {
  const { currentUser, userProfile, updateYearlyGoal } = useAuth();
  const { savedBooks } = useLibrary();

  const yearlyGoal = userProfile?.yearlyGoal || 24;

  const displayName = userProfile?.displayName || currentUser?.displayName || 'Reader';

  const stats = useMemo(() => {
    const totalBooks = savedBooks.length;
    const reading = savedBooks.filter(b => b.status === 'reading').length;
    const completed = savedBooks.filter(b => b.status === 'completed').length;
    const totalPages = savedBooks.reduce((sum, b) => sum + (b.pageCount || 0), 0);
    const pagesRead = savedBooks.reduce((sum, b) => {
      if (b.progress && b.pageCount) {
        return sum + Math.floor((b.progress / 100) * b.pageCount);
      }
      return sum;
    }, 0);

    const sortedBooks = [...savedBooks]
      .filter(book => book.lastRead)
      .sort((a, b) => b.lastRead - a.lastRead);

    let streak = 0;
    if (sortedBooks.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let currentDate = new Date(sortedBooks[0].lastRead);
      currentDate.setHours(0, 0, 0, 0);

      const oneDayMs = 24 * 60 * 60 * 1000;
      const daysDiff = Math.floor((today - currentDate) / oneDayMs);

      if (daysDiff <= 1) {
        streak = 1;
        for (let i = 1; i < sortedBooks.length; i++) {
          const prevDate = new Date(sortedBooks[i - 1].lastRead);
          prevDate.setHours(0, 0, 0, 0);
          const currDate = new Date(sortedBooks[i].lastRead);
          currDate.setHours(0, 0, 0, 0);
          const diff = Math.floor((prevDate - currDate) / oneDayMs);

          if (diff === 1) {
            streak++;
          } else {
            break;
          }
        }
      }
    }

    const avgProgress = totalBooks > 0
      ? savedBooks.reduce((sum, b) => sum + (b.progress || 0), 0) / totalBooks
      : 0;

    return {
      totalBooks,
      reading,
      completed,
      totalPages,
      pagesRead,
      streak,
      avgProgress: Math.round(avgProgress)
    };
  }, [savedBooks]);

  const recentBooks = useMemo(() => {
    return [...savedBooks]
      .sort((a, b) => (b.lastRead || b.savedAt) - (a.lastRead || a.savedAt))
      .slice(0, 4);
  }, [savedBooks]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleGoalChange = async (newGoal) => {
    if (newGoal >= 1) {
      try {
        await updateYearlyGoal(newGoal);
      } catch (error) {
        console.error('Failed to update goal:', error);
      }
    }
  };

  const goalProgress = Math.min(100, (stats.completed / yearlyGoal) * 100);

  return (
    <div className={styles.dashboard}>
      <div className={styles.welcome}>
          <h1 className={styles.title}>{getGreeting()}, {displayName}!</h1>
          <p className={styles.subtitle}>Here's your reading progress</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <SavedIcon width={24} height={24} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Total Books</span>
            <span className={styles.statValue}>{stats.totalBooks}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <NotesIcon width={24} height={24} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Currently Reading</span>
            <span className={styles.statValue}>{stats.reading}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <CalendarIcon width={24} height={24} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Completed</span>
            <span className={styles.statValue}>{stats.completed}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <TrendingIcon width={24} height={24} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Reading Streak</span>
            <span className={styles.statValue}>{stats.streak} days</span>
          </div>
        </div>
      </div>

      <div className={styles.dashboardContent}>
        <div className={styles.metricsSection}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>
                <TargetIcon width={20} height={20} />
                Yearly Reading Goal
              </h2>
              <input
                type="number"
                value={yearlyGoal}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 1;
                  handleGoalChange(Math.max(1, value));
                }}
                className={styles.goalInput}
                min="1"
              />
            </div>
            <div className={styles.goalContent}>
              <div className={styles.goalStats}>
                <span className={styles.goalCurrent}>{stats.completed}</span>
                <span className={styles.goalSeparator}>/</span>
                <span className={styles.goalTarget}>{yearlyGoal}</span>
                <span className={styles.goalLabel}>books</span>
              </div>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${goalProgress}%` }}
                />
              </div>
              <p className={styles.goalMessage}>
                {goalProgress >= 100
                  ? '🎉 Goal achieved! Set a new challenge?'
                  : `${yearlyGoal - stats.completed} book${yearlyGoal - stats.completed !== 1 ? 's' : ''} to go!`}
              </p>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>
                <TrendingIcon width={20} height={20} />
                Reading Progress
              </h2>
            </div>
            <div className={styles.pagesContent}>
              <div className={styles.pagesCircle}>
                <svg viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="url(#progressGradient)"
                    strokeWidth="8"
                    strokeDasharray={`${(stats.avgProgress / 100) * 251.2} 251.2`}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#E44D94" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className={styles.pagesText}>
                  <span className={styles.pagesNumber}>{stats.avgProgress}%</span>
                  <span className={styles.pagesLabel}>Average</span>
                </div>
              </div>
              <div className={styles.pagesStats}>
                <div className={styles.pagesStat}>
                  <span className={styles.pagesStatValue}>{stats.pagesRead.toLocaleString()}</span>
                  <span className={styles.pagesStatLabel}>Pages Read</span>
                </div>
                <div className={styles.pagesStat}>
                  <span className={styles.pagesStatValue}>{stats.totalPages.toLocaleString()}</span>
                  <span className={styles.pagesStatLabel}>Total Pages</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.recentSection}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>Recent Books</h2>
              <Link to="/library" className={styles.viewAll}>View All</Link>
            </div>
            {recentBooks.length > 0 ? (
              <div className={styles.recentBooks}>
                {recentBooks.map(book => (
                  <Link
                    key={book.firestoreId}
                    to={`/book/${book.id}`}
                    className={styles.recentBook}
                  >
                    <div className={styles.recentCover}>
                      {book.thumbnail ? (
                        <img src={book.thumbnail} className='img-cover' alt={book.title} />
                      ) : (
                        <div className={styles.recentNoCover}>
                          <img src={emptyLibraryIcon} alt="no cover" />
                        </div>
                      )}
                    </div>
                    <div className={styles.recentInfo}>
                      <h3>{book.title}</h3>
                      <p>{book.authors.join(', ')}</p>
                      {book.progress > 0 && (
                        <div className={styles.recentProgress}>
                          <div className={styles.recentProgressBar}>
                            <div
                              className={styles.recentProgressFill}
                              style={{ width: `${book.progress}%` }}
                            />
                          </div>
                          <span>{book.progress}%</span>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className={styles.emptyRecent}>
                <img src={emptyLibraryIcon} alt="empty library" className={styles.emptyIcon} />
                <p>No books in your library yet</p>
                <Link to="/library" className={styles.emptyLink}>Start adding books</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}