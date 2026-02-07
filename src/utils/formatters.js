import { LANGUAGE_NAMES, DEFAULT_READING_SPEED } from './constants';

export function formatGoogleBook(item) {
  if (!item || !item.volumeInfo) return null;

  const {
    volumeInfo = {},
    saleInfo = {},
    accessInfo = {}
  } = item;

  return {
    id: item.id,
    title: volumeInfo.title || 'Untitled',
    subtitle: volumeInfo.subtitle || '',
    authors: volumeInfo.authors || ['Unknown Author'],
    publisher: volumeInfo.publisher || '',
    publishedDate: volumeInfo.publishedDate || '',
    publishedYear: volumeInfo.publishedDate?.split('-')[0] || '',
    description: volumeInfo.description || 'No description available',
    pageCount: volumeInfo.pageCount || 0,

    categories: volumeInfo.categories || [],
    language: volumeInfo.language || 'en',
    printType: volumeInfo.printType || 'BOOK',
    maturityRating: volumeInfo.maturityRating || 'NOT_MATURE',

    averageRating: volumeInfo.averageRating || 0,
    ratingsCount: volumeInfo.ratingsCount || 0,

    thumbnail: volumeInfo.imageLinks?.thumbnail?.replace('http://', 'https://') || '',
    thumbnailLarge: volumeInfo.imageLinks?.large?.replace('http://', 'https://') ||
      volumeInfo.imageLinks?.medium?.replace('http://', 'https://') ||
      volumeInfo.imageLinks?.thumbnail?.replace('http://', 'https://') || '',
    smallThumbnail: volumeInfo.imageLinks?.smallThumbnail?.replace('http://', 'https://') || '',

    isbn10: getIsbn(volumeInfo.industryIdentifiers, 'ISBN_10'),
    isbn13: getIsbn(volumeInfo.industryIdentifiers, 'ISBN_13'),

    previewLink: volumeInfo.previewLink || '',
    infoLink: volumeInfo.infoLink || '',
    canonicalVolumeLink: volumeInfo.canonicalVolumeLink || '',

    saleability: saleInfo?.saleability || 'NOT_FOR_SALE',
    isEbook: saleInfo?.isEbook || false,
    listPrice: saleInfo?.listPrice || null,
    retailPrice: saleInfo?.retailPrice || null,
    buyLink: saleInfo?.buyLink || '',

    epub: accessInfo?.epub || { isAvailable: false },
    pdf: accessInfo?.pdf || { isAvailable: false },
    webReaderLink: accessInfo?.webReaderLink || '',
    accessViewStatus: accessInfo?.accessViewStatus || 'NONE',
  };
}

export function formatGoogleBooks(items) {
  if (!Array.isArray(items)) return [];

  return items
    .map(formatGoogleBook)
    .filter(Boolean);
}

function getIsbn(identifiers, type) {
  if (!identifiers) return '';
  const identifier = identifiers.find(id => id.type === type);
  return identifier?.identifier || '';
}

export function formatDate(dateString) {
  if (!dateString) return '';

  if (dateString.length === 4) {
    return dateString;
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function formatPageCount(pageCount) {
  if (!pageCount) return 'Unknown';
  return `${pageCount.toLocaleString()} pages`;
}

export function formatRating(rating, count) {
  if (!rating || !count) return 'No ratings';
  return `${rating.toFixed(1)} (${count.toLocaleString()} ratings)`;
}

export function truncateText(text, maxLength = 150) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

export function getLanguageName(code) {
  return LANGUAGE_NAMES[code] || code.toUpperCase();
}

export function estimateReadingTime(pageCount, pagesPerHour = DEFAULT_READING_SPEED) {
  if (!pageCount) return 'Unknown';

  const hours = pageCount / pagesPerHour;

  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return `~${minutes} min`;
  }

  if (hours < 10) {
    return `~${hours.toFixed(1)} hours`;
  }

  return `~${Math.round(hours)} hours`;
}

export function formatPrice(price) {
  if (!price || !price.amount) return 'Price not available';

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: price.currencyCode || 'USD',
  });

  return formatter.format(price.amount);
}