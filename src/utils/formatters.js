export function formatGoogleBook(item) {
  if (!item || !item.volumeInfo) return null;
  
  const { volumeInfo } = item;

  return {
    id: item.id,
    title: volumeInfo.title || 'Untitled',
    authors: volumeInfo.authors || ['Unknown Author'],
    description: volumeInfo.description || 'No description available',
    thumbnail: volumeInfo.imageLinks?.thumbnail || '',
    thumbnailLarge: volumeInfo.imageLinks?.large || 
                    volumeInfo.imageLinks?.medium || 
                    volumeInfo.imageLinks?.thumbnail || '',
    publishedDate: volumeInfo.publishedDate || '',
    pageCount: volumeInfo.pageCount || 0,
    categories: volumeInfo.categories || [],
    language: volumeInfo.language || 'en',
    previewLink: volumeInfo.previewLink || '',
    infoLink: volumeInfo.infoLink || '',
    publisher: volumeInfo.publisher || '',
    averageRating: volumeInfo.averageRating || 0,
    ratingsCount: volumeInfo.ratingsCount || 0,
    publishedYear: volumeInfo.publishedDate?.split('-')[0] || '',
  };
}

export function formatGoogleBooks(items) {
  if (!Array.isArray(items)) return [];
  
  return items
    .map(formatGoogleBook)
    .filter(Boolean);
}