import { useState, useEffect, useCallback } from "react";
import { searchBooks } from '../../../services/googleBooksAPI';
import BookCard from "./BookCard";
import {
  LANGUAGES,
  PRINT_TYPE_OPTIONS,
  FILTER_OPTIONS,
  POPULAR_TAGS
} from '../../../utils/constants';
import { SearchIcon, CloseIcon, FilterIcon, GridIcon, ListIcon, ErrorIcon } from "../../../components/icons";
import styles from './BookSearch.module.scss';

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function BookSearch({
  initialQuery = '',
  initialResults = [],
  onSearchUpdate
}) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState(initialResults);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [totalItems, setTotalItems] = useState(0);
  const [startIndex, setStartIndex] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    printType: 'all',
    filter: 'all',
    language: '',
    subject: '',
  });
  const [viewMode, setViewMode] = useState('grid');

  const debouncedQuery = useDebounce(query, 250);

  const performSearch = useCallback(async (searchQuery, index = 0, append = false) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setTotalItems(0);
      setHasMore(false);
      if (onSearchUpdate) {
        onSearchUpdate(searchQuery, []);
      }
      return;
    }

    setLoading(true);
    setError('');

    try {
      let enhancedQuery = searchQuery;
      if (filters.subject) {
        enhancedQuery += `+subject:${filters.subject}`;
      }

      const data = await searchBooks(enhancedQuery, {
        maxResults: 30,
        startIndex: index,
        printType: filters.printType,
        filter: filters.filter,
        langRestrict: filters.language,
      });

      if (append) {
        setResults(prevResults => {
          const newResults = [...prevResults, ...data.books];
          if (onSearchUpdate) {
            onSearchUpdate(searchQuery, newResults);
          }
          return newResults;
        });
      } else {
        setResults(data.books);
        if (onSearchUpdate) {
          onSearchUpdate(searchQuery, data.books);
        }
      }

      setTotalItems(data.totalItems);
      setHasMore(index + 30 < data.totalItems);
      setStartIndex(index);

      if (data.books.length === 0 && !append) {
        setError('No books found. Try adjusting your search or filters.');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        setError('Failed to search books. Please try again.');
        console.error('Search error:', error);
      }
    } finally {
      setLoading(false);
    }
  }, [filters, onSearchUpdate]);

  useEffect(() => {
    if (debouncedQuery) {
      performSearch(debouncedQuery, 0, false);
    } else {
      setResults([]);
      setTotalItems(0);
      setHasMore(false);
      if (onSearchUpdate) {
        onSearchUpdate('', []);
      }
    }
  }, [debouncedQuery]); 

  useEffect(() => {
    if (debouncedQuery) {
      performSearch(debouncedQuery, 0, false);
    }
  }, [filters]); 


  function loadMore() {
    if (!loading && hasMore) {
      performSearch(debouncedQuery, startIndex + 30, true);
    }
  }

  function handleFilterChange(filterName, value) {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  }

  function resetFilters() {
    setFilters({
      printType: 'all',
      filter: 'all',
      language: '',
      subject: '',
    });
  }

  const hasActiveFilters = filters.printType !== 'all' ||
    filters.filter !== 'all' ||
    filters.language !== '' ||
    filters.subject !== '';

  return (
    <div className={styles.bookSearch}>
      <div className={styles.searchHeader}>
        <div className={styles.searchBox}>
          <SearchIcon />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for books by title, author, or ISBN..."
            disabled={loading}
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setResults([]);
                setTotalItems(0);
                setHasMore(false);
                if (onSearchUpdate) {
                  onSearchUpdate('', []);
                }
              }}
              className={styles.clearButton}
              type="button"
              aria-label="Clear search"
            >
              <CloseIcon />
            </button>
          )}
        </div>

        <button
          className={`${styles.filterToggle} ${showFilters ? styles.active : ''} ${hasActiveFilters ? styles.hasFilters : ''}`}
          onClick={() => setShowFilters(!showFilters)}
          type="button"
        >
          <FilterIcon />
          <span>Filters</span>
          {hasActiveFilters && <span className={styles.filterBadge} />}
        </button>
      </div>

      {showFilters && (
        <div className={styles.filtersPanel}>
          <div className={styles.filterGroup}>
            <label>Content Type</label>
            <div className={styles.filterButtons}>
              {PRINT_TYPE_OPTIONS.map(option => (
                <button
                  key={option.value}
                  className={filters.printType === option.value ? styles.active : ''}
                  onClick={() => handleFilterChange('printType', option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.filterGroup}>
            <label>Availability</label>
            <div className={styles.filterButtons}>
              {FILTER_OPTIONS.map(option => (
                <button
                  key={option.value}
                  className={filters.filter === option.value ? styles.active : ''}
                  onClick={() => handleFilterChange('filter', option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.filterGroup}>
            <label>Language</label>
            <select
              value={filters.language}
              onChange={(e) => handleFilterChange('language', e.target.value)}
              className={styles.filterSelect}
            >
              {LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>Subject/Category</label>
            <input
              type="text"
              value={filters.subject}
              onChange={(e) => handleFilterChange('subject', e.target.value)}
              placeholder="e.g., fiction, science, history"
              className={styles.filterInput}
            />
          </div>

          {hasActiveFilters && (
            <button onClick={resetFilters} className={styles.resetButton}>
              Reset All Filters
            </button>
          )}
        </div>
      )}

      {results.length > 0 && (
        <div className={styles.toolbar}>
          <div className={styles.resultInfo}>
            <span className={styles.resultCount}>
              {totalItems.toLocaleString()} results
            </span>
          </div>

          <div className={styles.toolbarActions}>
            <div className={styles.viewToggle}>
              <button
                className={viewMode === 'grid' ? styles.active : ''}
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
              >
                <GridIcon />
              </button>
              <button
                className={viewMode === 'list' ? styles.active : ''}
                onClick={() => setViewMode('list')}
                aria-label="List view"
              >
                <ListIcon />
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && startIndex === 0 && (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Searching...</p>
        </div>
      )}

      {error && !loading && (
        <div className={styles.error}>
          <ErrorIcon />
          {error}
        </div>
      )}

      {results.length > 0 && (
        <>
          <div className={`${styles.results} ${styles[viewMode]}`}>
            {results.map(book => (
              <BookCard
                key={book.id}
                book={book}
                viewMode={viewMode}
              />
            ))}
          </div>

          {hasMore && (
            <div className={styles.loadMore}>
              <button onClick={loadMore} disabled={loading}>
                {loading ? (
                  <>
                    <div className={styles.spinner}></div>
                    Loading...
                  </>
                ) : (
                  'Load More Books'
                )}
              </button>
            </div>
          )}
        </>
      )}

      {!query && !loading && results.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <SearchIcon />
          </div>
          <h2>Search millions of books</h2>
          <p>Start typing to find your next read</p>

          <div className={styles.suggestions}>
            <p>Popular searches:</p>
            <div className={styles.tags}>
              {POPULAR_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => setQuery(tag)}
                  className={styles.tag}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}