import { doc, setDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../config/firebase';
import {
  INITIAL_DEPARTMENTS,
  INITIAL_PROJECTS,
  INITIAL_FACULTY_SUBMISSIONS,
  INITIAL_MESSAGES,
  INITIAL_LEADERBOARD
} from '../data/mockData';

export const seedFirestoreDatabase = async () => {
  if (!isFirebaseConfigured) {
    return {
      success: false,
      message: 'Firebase is running in Demo Persistence Mode. Add real credentials in settings to seed live Firestore.'
    };
  }

  try {
    // 1. Seed Departments
    for (const d of INITIAL_DEPARTMENTS) {
      await setDoc(doc(db, 'departments', d.id), d);
    }

    // 2. Seed Approved Projects
    for (const p of INITIAL_PROJECTS) {
      await setDoc(doc(db, 'projects', p.id), p);
    }

    // 3. Seed Faculty Submissions
    for (const s of INITIAL_FACULTY_SUBMISSIONS) {
      await setDoc(doc(db, 'submissions', s.id), s);
    }

    // 4. Seed Messages
    for (const m of INITIAL_MESSAGES) {
      await setDoc(doc(db, 'messages', m.id), m);
    }

    // 5. Seed Leaderboard
    for (const l of INITIAL_LEADERBOARD) {
      await setDoc(doc(db, 'leaderboard', l.id), l);
    }

    return {
      success: true,
      message: 'Successfully seeded Firestore DB with sample Projects, Submissions, Messages, and Leaderboard!'
    };
  } catch (error) {
    console.error('Firestore Seeding Error:', error);
    return {
      success: false,
      message: `Seeding error: ${error.message || 'Failed to seed Firestore'}`
    };
  }
};

// Disabled automatic seeding so that clean databases only show real registered users and projects
export const autoSeedIfEmpty = async () => {
  // Manual seeding only via Settings modal
};
