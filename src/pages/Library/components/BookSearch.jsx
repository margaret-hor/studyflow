import { useState } from "react";
import { searchBooks } from '../../../services/googleBooksAPI';
import BookCard from "./BookCard";
import styles from './BookSearch.module.scss';

export default function BookSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSearch(e) {
    e.preventDefault();

    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const books = await searchBooks(query);
      setResults(books);

      if (books.length === 0) {
        setError('No books found');
      }
    } catch (error) {
      setError('Failed to search books');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.bookSearch}>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for books..."
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.results}>
        {results.map(book => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </div>
  );
}