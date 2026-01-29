import { db } from "./firebase-config.js";
import { doc, getDoc, addDoc, collection, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

export async function showDonationReceipt(donationId) {
  try {
    const docRef = doc(db, "donations", donationId);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      alert("Donation record not found.");
      return;
    }

    const d = snap.data();

    // Send confirmation message to messages collection
    try {
      const itemsSummary = d.items?.map(i => `${i.qty} ${i.unit || ''} ${i.name}`).join(', ') || 'Items';
      await addDoc(collection(db, 'messages'), {
        userId: d.userId,
        senderRole: 'admin',
        type: 'donation_confirmation',
        donationId,
        category: d.category,
        items: itemsSummary,
        status: d.status || 'pending',
        message: `Your donation (${d.category}) has been received and recorded. Check your Messages for updates.`,
        createdAt: serverTimestamp()
      });
    } catch (msgErr) {
      console.error('Error saving confirmation message:', msgErr);
    }

    // Build items list HTML
    let itemsHTML = "";
    if (d.items && d.items.length > 0) {
      itemsHTML = d.items.map(i =>
        `<li>${i.qty} ${i.unit || ''} — ${i.name}</li>`
      ).join("");
    }

    // Create modal backdrop and content
    const backdrop = document.createElement('div');
    backdrop.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
    `;

    const modal = document.createElement('div');
    modal.style.cssText = `
      background: white;
      border-radius: 25px;
      padding: 2rem;
      max-width: 600px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    `;

    const dateStr = d.createdAt?.toDate ? d.createdAt.toDate().toLocaleString() : '';

    modal.innerHTML = `
      <h2 class="fw-bold text-center mb-1" style="color: var(--primary-orange);">
        Donation Receipt
      </h2>
      <p class="text-center mb-4" style="color: #8a5a3a; font-size: 0.95rem;">
        Thank you for your generosity!
      </p>

      <div style="margin-bottom: 1.5rem;">
        <div style="margin-bottom: 1rem;">
          <strong style="color: var(--dark-orange);">Donation ID:</strong><br>
          <span style="color: #333; word-break: break-all;">${donationId}</span>
        </div>

        <div style="margin-bottom: 1rem;">
          <strong style="color: var(--dark-orange);">Donor:</strong><br>
          <span style="color: #333;">${d.donorName || 'Anonymous'}</span>
        </div>

        <div style="margin-bottom: 1rem;">
          <strong style="color: var(--dark-orange);">Category:</strong><br>
          <span style="color: #333;">${d.category || ''}</span>
        </div>

        <div style="margin-bottom: 1rem;">
          <strong style="color: var(--dark-orange);">Items Donated:</strong><br>
          <ul style="margin-bottom: 0; color: #333;">${itemsHTML || '<li>No items</li>'}</ul>
        </div>

        <div style="margin-bottom: 1rem;">
          <strong style="color: var(--dark-orange);">Donation Type:</strong><br>
          <span style="color: #333;">${d.type || ''}</span>
        </div>

        <div style="margin-bottom: 1rem;">
          <strong style="color: var(--dark-orange);">Notes:</strong><br>
          <span style="color: #333;">${d.notes || 'None'}</span>
        </div>

        <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #eee;">
          <strong style="color: var(--dark-orange);">Submitted On:</strong><br>
          <small style="color: #666;">${dateStr}</small>
        </div>
      </div>

      <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
        <button id="closeReceiptBtn" class="btn btn-orange flex-grow-1" style="border-radius: 40px;">
          Close
        </button>
        <button id="homeReceiptBtn" class="btn btn-light flex-grow-1" style="border-radius: 40px;">
          Back to Categories
        </button>
      </div>
    `;

    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    // Close button handler
    document.getElementById('closeReceiptBtn').addEventListener('click', () => {
      backdrop.remove();
    });

    // Home button handler
    document.getElementById('homeReceiptBtn').addEventListener('click', () => {
      window.location.href = 'categories.html';
    });

  } catch (err) {
    console.error('Error loading receipt:', err);
    alert('Failed to load donation receipt. ' + (err.message || ''));
  }
}
