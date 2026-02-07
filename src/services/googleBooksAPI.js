import { formatGoogleBook } from '../utils/formatters';
import { GOOGLE_BOOKS_API_URL, MAX_RESULTS_PER_REQUEST } from '../utils/constants';

const API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY || '';

export async function searchBooks(query, options = {}) {
  try {
    const {
      maxResults = 30,
      startIndex = 0,
      printType = 'all',
      filter = 'all',
      langRestrict = '',
    } = options;

    const params = new URLSearchParams({
      q: query.trim(),
      maxResults: Math.min(maxResults, MAX_RESULTS_PER_REQUEST),
      startIndex,
      printType,
      fields: 'totalItems,items(id,volumeInfo(title,authors,imageLinks/thumbnail,publishedDate,averageRating))'
    });

    if (filter && filter !== 'all') {
      params.append('filter', filter);
    }

    if (langRestrict) {
      params.append('langRestrict', langRestrict);
    }

    if (API_KEY) {
      params.append('key', API_KEY);
    }

    const url = `${GOOGLE_BOOKS_API_URL}?${params.toString()}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Google Books API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    const books = (data.items || [])
      .map(item => formatGoogleBook(item))
      .filter(Boolean);

    const totalItems = data.totalItems || 0;

    return {
      books,
      totalItems,
    };
  } catch (error) {
    console.error('Error searching books:', error);
    throw error;
  }
}

export async function getBookById(bookId) {
  try {
    const params = new URLSearchParams();

    if (API_KEY) {
      params.append('key', API_KEY);
    }

    const url = `${GOOGLE_BOOKS_API_URL}/${bookId}${params.toString() ? '?' + params.toString() : ''}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch book: ${response.status}`);
    }

    const data = await response.json();
    return formatGoogleBook(data);
  } catch (error) {
    console.error('Error fetching book details:', error);
    throw error;
  }
}

export async function getBooksBySubject(subject, options = {}) {
  return searchBooks(`subject:${subject}`, options);
}

export async function getBooksByAuthor(author, options = {}) {
  return searchBooks(`inauthor:${author}`, options);
}

export async function getBookByIsbn(isbn) {
  const { books } = await searchBooks(`isbn:${isbn}`, { maxResults: 1 });
  return books[0] || null;
}