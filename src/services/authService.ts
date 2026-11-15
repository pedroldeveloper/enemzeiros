import {
  createUserWithEmailAndPassword,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { deleteDoc, doc, getDoc, getDocs, collection, query, writeBatch, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, firebaseConfigured } from '../lib/firebase';

function requireFirebase() {
  if (!auth || !db) throw new Error('Configure o Firebase no arquivo .env.local para usar contas e sincronização.');
  return { auth, db };
}

export function subscribeToAuth(callback: (user: User | null) => void) {
  if (!auth) {
    callback(null);
    return () => undefined;
  }
  return onAuthStateChanged(auth, callback);
}

export async function register(email: string, password: string, displayName?: string) {
  const { auth: currentAuth, db: currentDb } = requireFirebase();
  const result = await createUserWithEmailAndPassword(currentAuth, email.trim(), password);
  if (displayName?.trim()) await updateProfile(result.user, { displayName: displayName.trim() });
  await setDoc(doc(currentDb, 'users', result.user.uid), {
    displayName: displayName?.trim() || '',
    goals: { overall: 800, essay: 900 },
    preferences: { theme: 'system' },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return result.user;
}

export async function login(email: string, password: string) {
  const { auth: currentAuth } = requireFirebase();
  return (await signInWithEmailAndPassword(currentAuth, email.trim(), password)).user;
}

export async function sendReset(email: string) {
  const { auth: currentAuth } = requireFirebase();
  await sendPasswordResetEmail(currentAuth, email.trim());
}

export async function logout() {
  if (!auth) return;
  await firebaseSignOut(auth);
}

export async function updateUserSettings(uid: string, patch: { displayName?: string; overallGoal?: number; essayGoal?: number; theme?: 'light' | 'dark' | 'system' }) {
  const { db: currentDb } = requireFirebase();
  const userDoc = doc(currentDb, 'users', uid);
  const currentPatch: Record<string, unknown> = { updatedAt: serverTimestamp() };
  if (patch.displayName !== undefined) {
    currentPatch.displayName = patch.displayName.trim();
    const currentUser = auth?.currentUser;
    if (currentUser?.uid === uid) await updateProfile(currentUser, { displayName: patch.displayName.trim() });
  }
  if (patch.overallGoal !== undefined) currentPatch['goals.overall'] = patch.overallGoal;
  if (patch.essayGoal !== undefined) currentPatch['goals.essay'] = patch.essayGoal;
  if (patch.theme !== undefined) currentPatch['preferences.theme'] = patch.theme;
  await updateDoc(userDoc, currentPatch);
}

export async function readUserSettings(uid: string) {
  const { db: currentDb } = requireFirebase();
  const snapshot = await getDoc(doc(currentDb, 'users', uid));
  return snapshot.exists() ? snapshot.data() : null;
}

export async function deleteAccountAndData(user: User) {
  const { db: currentDb } = requireFirebase();
  const subcollections = ['lessonProgress', 'questionAttempts', 'essaySubmissions', 'studySessions'];
  for (const subcollection of subcollections) {
    const snapshot = await getDocs(query(collection(currentDb, 'users', user.uid, subcollection)));
    if (subcollection === 'lessonProgress') {
      for (const progressDoc of snapshot.docs) {
        const history = await getDocs(collection(progressDoc.ref, 'history'));
        for (let start = 0; start < history.docs.length; start += 400) {
          const batch = writeBatch(currentDb);
          history.docs.slice(start, start + 400).forEach((item) => batch.delete(item.ref));
          await batch.commit();
        }
      }
    }
    for (let start = 0; start < snapshot.docs.length; start += 400) {
      const batch = writeBatch(currentDb);
      snapshot.docs.slice(start, start + 400).forEach((item) => batch.delete(item.ref));
      await batch.commit();
    }
  }
  await deleteDoc(doc(currentDb, 'users', user.uid));
  await deleteUser(user);
}

export async function reauthenticateUser(user: User, password: string) {
  const email = user.email;
  if (!email) throw new Error('A exclusão desta conta requer autenticação por e-mail e senha.');
  await reauthenticateWithCredential(user, EmailAuthProvider.credential(email, password));
}

export function authUnavailableReason() {
  return firebaseConfigured ? '' : 'Contas e sincronização ficam disponíveis depois de configurar o Firebase.';
}
