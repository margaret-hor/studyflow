import { formatGoogleBooks, formatGoogleBook } from "../utils/formatters";

const API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;
const BASE_URL = 'https://www.googleapis.com/books/v1/';

export async function searchBooks(query, maxResults = 30) {
  try {
    if (!query || typeof query !== 'string') {
      throw new Error('Query must be a non-empty string');
    }

    const url = `${BASE_URL}volumes?q=${encodeURIComponent(query)}&key=${API_KEY}&maxResults=${maxResults}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch books');

    const data = await response.json();
    console.log(data);

    return formatGoogleBooks(data.items);
  } catch (error) {
    console.error('Error searching books:', error);
    throw error;
  }
}

export async function getBookId(bookId) {
  try {
    if (!bookId) throw new Error('Book ID is required');

    const url = `${BASE_URL}/volumes/${bookId}?key=${API_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Book not found');
      }
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(data);
    
    return formatGoogleBook(data)
  } catch (error) {
    console.error('Error fetching book:', error);
    throw error;
  }
}

export async function searchByCategory(category, maxResults = 30) {
  return searchBooks(`subject:${category}`, maxResults);
}

export async function searchByAuthor(author, maxResults = 30) {
  return searchBooks(`inauthor:${author}`, maxResults);
}