import { auth, db, storage } from './firebase-config.js';
import { addDoc, collection, serverTimestamp, doc, updateDoc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js";

export async function submitDonation({ category, type='in_kind', amount=0, items = [], notes = '', file = null, location = '' }) {
  const user = auth.currentUser;
  const donation = {
    userId: user ? user.uid : null,
    donorName: user ? (user.displayName || user.email) : 'Anonymous',
    category,
    type,
    amount: type === 'cash' ? Number(amount || 0) : null,
    items: type === 'in_kind' ? items : [],
    location: location || null,
    notes: notes || null,
    status: 'pending',
    createdAt: serverTimestamp()
  };

  const docRef = await addDoc(collection(db, 'donations'), donation);

  if (file && user) {
    const storageRef = ref(storage, `receipts/${user.uid}/${docRef.id}/${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    await updateDoc(doc(db, 'donations', docRef.id), { attachments: [url] });
  }

  return docRef.id;
}
