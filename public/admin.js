import { db, functions, auth } from './firebase-config.js';
import { logoutUser } from './firebase-auth.js';
import { query, collection, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { httpsCallable } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-functions.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

async function checkAdminAndInit() {
  onAuthStateChanged(auth, async user => {
    if (!user) { window.location.href = '/'; return; }
    const uDoc = await getDoc(doc(db, 'users', user.uid));
    if (!uDoc.exists() || uDoc.data().role !== 'admin') {
      alert('Access denied'); window.location.href = '/'; return;
    }
    initFeed();
  });
}

function initFeed() {
  const q = query(collection(db, 'donations'), orderBy('createdAt', 'desc'));
  const tbody = document.getElementById('donationsTable');
  onSnapshot(q, snapshot => {
    tbody.innerHTML = '';
    snapshot.forEach(snap => {
      const d = snap.data();
      const id = snap.id;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${d.category||''}</td>
        <td>${d.type==='cash' ? '₱' + (d.amount||0) : (d.items?.length || 1)}</td>
        <td>${d.donorName || 'Anonymous'}</td>
        <td>${d.createdAt?.toDate ? d.createdAt.toDate().toLocaleString() : ''}</td>
        <td>
          <button class="btn btn-sm btn-success" onclick="verifyDonation('${id}')">Verify</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  });
}

window.verifyDonation = async function(donationId) {
  try {
    const verify = httpsCallable(functions, 'verifyDonation');
    const res = await verify({ donationId });
    alert('Donation verified');
  } catch (err) {
    alert(err.message || 'Verify error');
  }
}

checkAdminAndInit();

// Wire logout button
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    try {
      await logoutUser();
      window.location.href = '/';
    } catch (err) {
      alert(err.message || 'Logout failed');
    }
  });
}
