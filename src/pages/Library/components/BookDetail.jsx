import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getBookById } from '../../../services/googleBooksAPI';
import { useLibrary } from '../../../hooks/useLibrary';
import { useComments } from '../../../hooks/useComments';
import { useAuth } from '../../../contexts/AuthContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from './BookDetail.module.scss';
import { ArrowLeftIcon, ArrowRightIcon, RemoveIcon, SparklesIcon, SettingsIcon } from '../../../components/icons';
import emptyLibraryIcon from "../../../assets/icons/empty_library_icon.svg";

import AIAssistant from '../../AIAssistant/AIAssistant';
import ReadingSettings from '../../ReadingSettings/ReadingSettings';

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();

  const {
    savedBooks,
    saveBook,
    updateProgress,
    addNote,
    isBookSaved
  } = useLibrary();

  const {
    comments,
    loading: commentsLoading,
    addComment,
    deleteComment
  } = useComments(id);

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const [progress, setProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [notes, setNotes] = useState('');
  const [newComment, setNewComment] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [pageInputValue, setPageInputValue] = useState('');
  const [deletingComment, setDeletingComment] = useState(null);

  const [showAI, setShowAI] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const savedBook = savedBooks.find(b => b.id === id);
  const isSaved = isBookSaved(id);
  const pageInputRef = useRef(null);

  useEffect(() => {
    loadBook();
  }, [id]);

  useEffect(() => {
    if (savedBook) {
      setProgress(savedBook.progress || 0);
      setCurrentPage(savedBook.currentPage || 0);
      setPageInputValue((savedBook.currentPage || 0).toString());
      setNotes(savedBook.notes || '');
    } else if (book) {
      setCurrentPage(0);
      setPageInputValue('0');
    }
  }, [savedBook, book]);

  async function loadBook() {
    setLoading(true);
    setError('');

    try {
      const data = await getBookById(id);
      setBook(data);
    } catch (err) {
      setError('Failed to load book details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      await saveBook(book);
    } catch (error) {
      console.error('Error saving book:', error);
    }
  }

  async function handleProgressChange(newProgress) {
    setProgress(newProgress);
    if (savedBook) {
      const totalPages = book?.pageCount || 1;
      const newPage = Math.round((newProgress / 100) * totalPages);
      setCurrentPage(newPage);
      setPageInputValue(newPage.toString());
      await updateProgress(savedBook.firestoreId, newProgress, { currentPage: newPage });
    }
  }

  async function handlePageChange(newPage) {
    const totalPages = book?.pageCount || 1;
    const validatedPage = Math.max(0, Math.min(totalPages, newPage));

    setCurrentPage(validatedPage);
    setPageInputValue(validatedPage.toString());

    const newProgress = Math.min(100, Math.round((validatedPage / totalPages) * 100));
    setProgress(newProgress);

    if (savedBook) {
      await updateProgress(savedBook.firestoreId, newProgress, { currentPage: validatedPage });
    }
  }

  const goToNextPage = () => {
    const totalPages = book?.pageCount || 1;
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 0) {
      handlePageChange(currentPage - 1);
    }
  };

  const jumpToPercentage = (percentage) => {
    const totalPages = book?.pageCount || 1;
    const newPage = Math.round((percentage / 100) * totalPages);
    handlePageChange(newPage);
  };

  const quickJumps = [
    { label: 'Start', value: 0 },
    { label: '25%', value: 25 },
    { label: '50%', value: 50 },
    { label: '75%', value: 75 },
    { label: 'End', value: 100 }
  ];

  async function handleSaveNotes() {
    if (savedBook) {
      await addNote(savedBook.firestoreId, notes);
      setIsEditingNotes(false);
    }
  }

  async function handleAddComment() {
    if (!newComment.trim()) return;

    try {
      await addComment(id, newComment);
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
      alert('Failed to add comment. Please try again.');
    }
  }

  async function handleDeleteComment(commentId, commentUserId) {
    if (!confirm('Delete this comment?')) return;

    setDeletingComment(commentId);
    try {
      await deleteComment(commentId, commentUserId);
    } catch (error) {
      console.error('Failed to delete comment:', error);
      alert(error.message || 'Failed to delete comment');
    } finally {
      setDeletingComment(null);
    }
  }

  function goBack() {
    const from = location.state?.from;
    if (from) {
      navigate(from);
    } else {
      navigate('/library');
    }
  }

  function formatCommentDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }

  const markdownPlaceholder = `# My Book Notes

## Key Takeaways
- First important point
- Second important point

## Favorite Quotes
> "Your favorite quote here"

## Notes
Write your detailed notes here...

**Formatting examples:**
- **Bold text** with **double asterisks**
- *Italic text* with *single asterisks*
- \`Code snippets\` with backticks
- [Links](https://example.com)`;

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading book details...</p>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className={styles.error}>
        <h2>Failed to load book</h2>
        <p>{error}</p>
        <button onClick={goBack} className={styles.backButton}>Go Back</button>
      </div>
    );
  }

  const totalPages = book.pageCount || 1;

  const getCleanDescription = () => {
    if (!book.description) return 'No description available.';

    const parser = new DOMParser();
    const doc = parser.parseFromString(book.description, 'text/html');
    return doc.body.textContent || 'No description available.';
  };

  return (
    <div className={styles.bookDetail}>
      <header className={styles.header}>
        <button onClick={goBack} className={styles.backButton}>
          <ArrowLeftIcon /> Back
        </button>
      </header>

      <div className={styles.content}>
        <div className={styles.sidebar}>
          <div className={styles.coverSection}>
            {book.thumbnailLarge || book.thumbnail ? (
              <img
                src={book.thumbnailLarge || book.thumbnail}
                alt={book.title}
                className={styles.cover}
              />
            ) : (
              <div className={styles.noCover}>
                <img src={emptyLibraryIcon} alt="no cover" />
                <p>No Cover Available</p>
              </div>
            )}
          </div>

          <div className={styles.actions}>
            {!isSaved ? (
              <button onClick={handleSave} className={styles.primaryButton}>
                Save to Library
              </button>
            ) : (
              <div className={styles.savedBadge}>
                In Your Library
              </div>
            )}

            {book.previewLink && (
              <a
                href={book.previewLink}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.secondaryButton}
              >
                Preview on Google
              </a>
            )}

            <button
              onClick={() => setShowSettings(true)}
              className={`${styles.secondaryButton} ${styles.settingsButton}`}
            >
              <SettingsIcon />
              Reading Settings
            </button>

            <button
              onClick={() => setShowAI(true)}
              className={`${styles.secondaryButton} ${styles.aiButton}`}
            >
              <SparklesIcon />
              AI Assistant
            </button>
          </div>

          {isSaved && (
            <div className={styles.progressSection}>
              <div className={styles.progressHeader}>
                <span>Reading Progress</span>
                <div className={styles.progressStats}>
                  <span className={styles.progressValue}>{progress}%</span>
                  <span className={styles.pageCount}>{currentPage} / {totalPages} pages</span>
                </div>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => handleProgressChange(parseInt(e.target.value))}
                className={styles.progressSlider}
              />

              <div className={styles.pageNavigation}>
                <button
                  onClick={goToPrevPage}
                  disabled={currentPage <= 0}
                  className={styles.pageButton}
                  aria-label="Previous page"
                >
                  <ArrowLeftIcon />
                </button>

                <div className={styles.pageInputContainer}>
                  <div className={styles.pageInputGroup}>
                    <input
                      ref={pageInputRef}
                      type="number"
                      value={pageInputValue}
                      onChange={(e) => setPageInputValue(e.target.value)}
                      onBlur={() => {
                        const newPage = parseInt(pageInputValue) || 0;
                        handlePageChange(newPage);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const newPage = parseInt(pageInputValue) || 0;
                          handlePageChange(newPage);
                        }
                      }}
                      min="0"
                      max={totalPages}
                      className={styles.pageInput}
                      aria-label="Current page number"
                    />
                    <span className={styles.pageTotal}>/ {totalPages}</span>
                  </div>
                  <div className={styles.pageLabel}>Current Page</div>
                </div>

                <button
                  onClick={goToNextPage}
                  disabled={currentPage >= totalPages}
                  className={styles.pageButton}
                  aria-label="Next page"
                >
                  <ArrowRightIcon />
                </button>
              </div>

              <div className={styles.quickJump}>
                {quickJumps.map((jump) => (
                  <button
                    key={jump.label}
                    onClick={() => jumpToPercentage(jump.value)}
                    className={`${styles.quickJumpButton} ${progress >= jump.value ? styles.active : ''}`}
                    aria-label={`Jump to ${jump.label}`}
                  >
                    {jump.label}
                  </button>
                ))}
              </div>

              <div className={styles.progressLabels}>
                <span>Not Started</span>
                <span>Completed</span>
              </div>
            </div>
          )}

          <div className={styles.metaInfo}>
            {book.publishedYear && (
              <div className={styles.metaItem}>
                <span>Published {book.publishedYear}</span>
              </div>
            )}
            {book.pageCount > 0 && (
              <div className={styles.metaItem}>
                <span>{book.pageCount} pages</span>
              </div>
            )}
            {book.averageRating > 0 && (
              <div className={styles.metaItem}>
                <span>{book.averageRating} ({book.ratingsCount} ratings)</span>
              </div>
            )}
          </div>
        </div>

        <div className={styles.main}>
          <h1 className={styles.title}>{book.title}</h1>
          <p className={styles.authors}>by {book.authors.join(', ')}</p>

          {book.publisher && (
            <p className={styles.publisher}>
              Published by {book.publisher}
              {book.publishedDate && ` on ${book.publishedDate}`}
            </p>
          )}

          {book.categories && book.categories.length > 0 && (
            <div className={styles.categories}>
              {book.categories.map((category, i) => (
                <span key={i} className={styles.category}>{category}</span>
              ))}
            </div>
          )}

          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'overview' ? styles.active : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            {isSaved && (
              <button
                className={`${styles.tab} ${activeTab === 'notes' ? styles.active : ''}`}
                onClick={() => setActiveTab('notes')}
              >
                Notes
              </button>
            )}
            <button
              className={`${styles.tab} ${activeTab === 'comments' ? styles.active : ''}`}
              onClick={() => setActiveTab('comments')}
            >
              Comments ({comments.length})
            </button>
          </div>

          <div className={styles.tabContent}>
            {activeTab === 'overview' && (
              <div className={styles.overview}>
                <h2>Description</h2>
                <div className={styles.description}>
                  {getCleanDescription()}
                </div>
              </div>
            )}

            {activeTab === 'notes' && isSaved && (
              <div className={styles.notes}>
                <div className={styles.notesHeader}>
                  <h2>My Notes</h2>
                  {!isEditingNotes && notes && (
                    <button onClick={() => setIsEditingNotes(true)} className={styles.editButton}>
                      Edit
                    </button>
                  )}
                </div>

                {isEditingNotes ? (
                  <div className={styles.notesEditor}>
                    <div className={styles.markdownHelp}>
                      <p>
                        <span>Markdown Formatting: </span>
                        Use **bold**, *italic*, `code`, # headings, - lists, &gt; quotes
                      </p>
                    </div>

                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={markdownPlaceholder}
                      rows={10}
                      className={styles.markdownTextarea}
                    />

                    <div className={styles.notesActions}>
                      <button onClick={() => setIsEditingNotes(false)} className={styles.cancelButton}>
                        Cancel
                      </button>
                      <button onClick={handleSaveNotes} className={styles.saveButton}>
                        Save Notes
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={styles.notesDisplay}>
                    {notes ? (
                      <div className={styles.markdownContent}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {notes}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <div className={styles.emptyNotes}>
                        <p>No notes yet</p>
                        <button onClick={() => setIsEditingNotes(true)}>Add Notes</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'comments' && (
              <div className={styles.comments}>
                <h2>Community Comments</h2>

                <div className={styles.commentForm}>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts about this book..."
                    rows={3}
                    disabled={!currentUser}
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className={styles.addCommentButton}
                  >
                    add comment
                  </button>
                </div>

                {commentsLoading ? (
                  <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <p>Loading comments...</p>
                  </div>
                ) : (
                  <div className={styles.commentsList}>
                    {comments.length > 0 ? (
                      comments.map((comment) => (
                        <div key={comment.id} className={styles.comment}>
                          <div className={styles.commentHeader}>
                            <div className={styles.commentUser}>
                              <div className={styles.userAvatar}>
                                {comment.userName.charAt(0).toUpperCase()}
                              </div>
                              <div className={styles.userInfo}>
                                <span className={styles.userName}>{comment.userName}</span>
                                <span className={styles.commentDate}>
                                  {formatCommentDate(comment.createdAt)}
                                </span>
                              </div>
                            </div>
                            {currentUser && currentUser.uid === comment.userId && (
                              <button
                                onClick={() => handleDeleteComment(comment.id, comment.userId)}
                                disabled={deletingComment === comment.id}
                                className={styles.deleteButton}
                                aria-label="Delete comment"
                              >
                                <RemoveIcon />
                              </button>
                            )}
                          </div>
                          <p className={styles.commentText}>{comment.text}</p>
                        </div>
                      ))
                    ) : (
                      <p className={styles.noComments}>
                        No comments yet. Be the first to share your thoughts!
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <AIAssistant
        book={book}
        isOpen={showAI}
        onClose={() => setShowAI(false)}
        currentPage={currentPage}
      />

      <ReadingSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

    </div>
  );
}