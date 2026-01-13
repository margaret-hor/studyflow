import { useState, useEffect } from "react";
import { collection, addDoc, deleteDoc, doc, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";

export function useLibrary() {
  const { currentUser } = useAuth();

  const [savedBooks, setSavedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      setSavedBooks([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'library'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const books = snapshot.docs.map(doc => ({
          firestoreId: doc.id,
          ...doc.data()
        }));

        setSavedBooks(books);
        setLoading(false);
      },
      (error) => {
        console.error('Error:', error);
        setError(error.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [currentUser]);

  async function saveBook(book) {
    try {
      const isAlreadySaved = savedBooks.some(b => b.id === book.id);
      if (isAlreadySaved) {
        throw new Error('Book already saved');
      }

      await addDoc(collection(db, 'library'), {
        userId: currentUser.uid,
        ...book,
        savedAt: Date.now(),
        notes: '',
        progress: 0
      });

      return { success: true };
    } catch (error) {
      console.error('Error saving book:', error);
      throw error;
    }
  }

  async function removeBook(firestoreId) {
    try {
      await deleteDoc(doc(db, 'library', firestoreId));
      return { success: true };
    } catch (error) {
      console.error('Error removing book:', error);
      throw error;
    }
  }

  const isBookSaved = (bookId) => savedBooks.some(book => book.id === bookId);

  return {
    savedBooks,
    loading,
    error,
    saveBook,
    removeBook,
    isBookSaved
  };
}