import { useState, useEffect } from "react";
import { searchBooks } from '../../../services/googleBooksAPI';
import BookCard from "./BookCard";
import styles from './BookSearch.module.scss';

export default function BookSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setError('');
      return;
    }

    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        const books = await searchBooks(query);
        setResults(books);
        setError(books.length === 0 ? 'No books found' : '');
      } catch (error) {
        console.error('Search error:', error);
        setError('Failed to search books');
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query])

  return (
    <div className={styles.bookSearch}>
      <div className={styles.searchContainer}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for books..."
          className={styles.searchInput}
          autoFocus
        />
        {loading && <div className={styles.loadingSpinner}></div>}
      </div>

      <div className={styles.results}>
        {loading ? (
          <p className={styles.loadingMessage}>Searching for "{query}"...</p>
        ) : results.length === 0 && query ? (
          <p className={styles.noResults}>No books found for "{query}"</p>
        ) : (
          results.map(book => (
            <BookCard key={book.id} book={book} />
          ))
        )}
      </div>
    </div>
  );
}