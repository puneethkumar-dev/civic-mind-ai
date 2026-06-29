import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, isInitialized } from '../services/firebaseConfig';

/**
 * Custom hook to listen to issues in real-time.
 * Falls back to localStorage events for local/offline testing.
 * 
 * @param {string|null} uid Filter by user ID if provided, otherwise fetches all issues
 * @returns {Array} issues
 */
export const useFirestoreListener = (uid = null) => {
  const [issues, setIssues] = useState([]);

  // Fetch local storage issues
  const getLocalIssues = () => {
    try {
      const list = localStorage.getItem('civicmind_local_issues');
      const parsed = list ? JSON.parse(list) : [];
      if (uid) {
        return parsed.filter(item => item.reportedBy?.uid === uid);
      }
      return parsed;
    } catch (e) {
      console.error('Error reading local issues in listener:', e);
      return [];
    }
  };

  useEffect(() => {
    let unsubscribe = null;
    let fallbackCleanup = null;
    let useLocal = !isInitialized || (uid && uid.startsWith('mock-'));
 
    if (!useLocal) {
      try {
        const issuesRef = collection(db, 'issues');
        const q = uid 
          ? query(issuesRef, where('reportedBy.uid', '==', uid))
          : query(issuesRef);
 
        unsubscribe = onSnapshot(q, (snapshot) => {
          const dbIssues = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            dbIssues.push({
              ...data,
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
              updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
            });
          });
 
          // Merge local issues to maintain consistent offline testing data if any exists
          const localList = getLocalIssues();
          const merged = [...dbIssues];
          for (const local of localList) {
            if (!merged.some(item => item.issueId === local.issueId)) {
              merged.push(local);
            }
          }
 
          // Sort descending by creation date
          merged.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
          });
 
          setIssues(merged);
        }, (error) => {
          console.warn('[Firestore Listener] Snapshot listener failed or permission denied. Falling back to local storage:', error.message);
          setIssues(getLocalIssues());

          if (!fallbackCleanup) {
            const handleStorageChange = (e) => {
              if (e.key === 'civicmind_local_issues') {
                setIssues(getLocalIssues());
              }
            };
            const handleCustomChange = () => {
              setIssues(getLocalIssues());
            };
            window.addEventListener('storage', handleStorageChange);
            window.addEventListener('civicmind_local_issues_updated', handleCustomChange);

            fallbackCleanup = () => {
              window.removeEventListener('storage', handleStorageChange);
              window.removeEventListener('civicmind_local_issues_updated', handleCustomChange);
            };
          }
        });
      } catch (err) {
        console.warn('[Firestore Listener] Setup failed. Falling back to local storage:', err.message);
        useLocal = true;
      }
    }
 
    if (useLocal || !unsubscribe) {
      // Load initial offline data
      setIssues(getLocalIssues());
 
      // React to changes in other tabs
      const handleStorageChange = (e) => {
        if (e.key === 'civicmind_local_issues') {
          setIssues(getLocalIssues());
        }
      };
 
      // React to local updates in the same tab instantly
      const handleCustomChange = () => {
        setIssues(getLocalIssues());
      };
 
      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('civicmind_local_issues_updated', handleCustomChange);
 
      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('civicmind_local_issues_updated', handleCustomChange);
      };
    }
 
    return () => {
      if (unsubscribe) unsubscribe();
      if (fallbackCleanup) fallbackCleanup();
    };
  }, [uid]);

  return issues;
};
