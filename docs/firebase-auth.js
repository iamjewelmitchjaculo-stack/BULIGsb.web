import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { doc, setDoc, serverTimestamp, getDoc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { auth, db } from "./firebase-config.js";

export async function signupUser({ name, email, password, location }) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const uid = cred.user.uid;
  await updateProfile(cred.user, { displayName: name }).catch(()=>{});
  await setDoc(doc(db, 'users', uid), {
    name,
    email,
    location: location || null,
    role: 'user',
    createdAt: serverTimestamp()
  });
  return cred;
}

export async function loginUser(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function sendPasswordReset(email) {
  return sendPasswordResetEmail(auth, email);
}

export function logoutUser() {
  return signOut(auth);
}

export function onAuthChange(handler) {
  return onAuthStateChanged(auth, handler);
}

export async function getUserRole(uid) {
  if (!uid) return null;
  const d = await getDoc(doc(db, 'users', uid));
  return d.exists() ? d.data().role : null;
}
