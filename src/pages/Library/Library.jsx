import { useState } from 'react';
import { useLibrary } from '../../hooks/useLibrary';
import BookSearch from './components/BookSearch';
import BookCard from './components/BookCard';
import styles from './Library.module.scss';

export default function Library() {
  const [activeTab, setActiveTab] = useState('search');
  const { savedBooks, loading, removeBook } = useLibrary();

  async function handleRemove (firestoreId) {
    if (!confirm('Remove this book from your library?')) {
      return;
    }

    try {
      await removeBook(firestoreId);
    } catch (error) {
      console.error('Failed to remove book', error);
      throw error;
    }
  };

  return (
    <div className={styles.library}>
      <h1>Library</h1>

      <div className={styles.tabs}>
        <button
          className={activeTab === 'search' ? styles.active : ''}
          onClick={() => setActiveTab('search')}
        >
          Search Books
        </button>
        <button
          className={activeTab === 'saved' ? styles.active : ''}
          onClick={() => setActiveTab('saved')}
        >
          My Library ({savedBooks.length})
        </button>
      </div>

      {activeTab === 'search' ? (
        <BookSearch />
      ) : (
        <div className={styles.savedBooks}>
          {loading ? (
            <p>Loading your library...</p>
          ) : savedBooks.length === 0 ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyIcon}>📚</p>
              <h2>Your library is empty</h2>
              <p>Search for books and save them here!</p>
              <button onClick={() => setActiveTab('search')}>
                Start Searching
              </button>
            </div>
          ) : (
            <div className={styles.grid}>
              {savedBooks.map(book => (
                <div key={book.firestoreId} className={styles.bookItem}>
                  <BookCard book={book} />
                  <button
                    onClick={() => handleRemove(book.firestoreId)}
                    className={styles.removeButton}
                  >
                    🗑 Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}