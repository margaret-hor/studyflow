import { useState } from "react";
import { useLibrary } from "../../../hooks/useLibrary";
import { Link } from 'react-router-dom';
import styles from "./BookCard.module.scss";

export default function BookCard({ book }) {
  const { saveBook, isBookSaved } = useLibrary();
  const [saving, setSaving] = useState(false);

  const isSaved = isBookSaved(book.id);

  async function handleSave() {
    setSaving(true);
    try {
      await saveBook(book);
    } catch (error) {
      console.error('Error saving book:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.bookCard}>
      <Link to={`/book/${book.id}`} className={styles.coverLink}>
        {book.thumbnail ? (
          <img src={book.thumbnail} alt={book.title} className={styles.thumbnail} />
        ) : (
          <div className={styles.noThumbnail}>
            <span>📚</span>
            <p>No cover</p>
          </div>
        )}
      </Link>

      <div className={styles.info}>
        <h3 className={styles.title}>{book.title}</h3>

        <p className={styles.authors}>
          {book.authors.join(', ')}
        </p>

        {book.description && (
          <p className={styles.description}>
            {book.description.substring(0, 150)}
            {book.description.length > 150 && '...'}
          </p>
        )}

        <div className={styles.actions}>
          {!isSaved ? (
            <button
              onClick={handleSave}
              disabled={saving}
              className={styles.saveButton}
            >
              {saving ? 'Saving...' : 'Save to Library'}
            </button>
          ) : (
            <span className={styles.saved}>✓ Saved</span>
          )}

          {book.previewLink && (
            <a
              href={book.previewLink}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.previewLink}
            >
              Preview
            </a>
          )}
        </div>
      </div>
    </div>
  );
}