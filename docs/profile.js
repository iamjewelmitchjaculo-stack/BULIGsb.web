import { auth, db } from "./firebase-config.js";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

import {
  updateProfile,
  updatePassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

const avatar = document.getElementById("avatar");
const displayName = document.getElementById("displayName");
const displayEmail = document.getElementById("displayEmail");

const nameInput = document.getElementById("nameInput");
const emailInput = document.getElementById("emailInput");
const aboutInput = document.getElementById("aboutInput");

const donationHistory = document.getElementById("donationHistory");

const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");
const backBtn = document.getElementById("backBtn");

let backDestination = "categories.html";

console.log('profile.js loaded, backBtn element:', backBtn);

// Function to handle back button navigation
function goBack() {
  console.log('goBack() called, navigating to:', backDestination);
  setTimeout(() => {
    window.location.href = backDestination;
  }, 100);
}

// Add click handler - check if button exists
if (backBtn) {
  console.log('Adding click listener to backBtn');
  backBtn.onclick = function() {
    console.log('backBtn clicked!');
    goBack();
  };
} else {
  console.error('backBtn element not found!');
}

// Set back button destination based on user role
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    console.log('No user logged in, redirecting to login');
    window.location.href = "login.html";
    return;
  }
  
  console.log('User authenticated:', user.uid);
  try {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    console.log('User snapshot exists:', userSnap.exists());
    if (userSnap.exists()) {
      console.log('User data:', userSnap.data());
      if (userSnap.data().role === 'admin') {
        backDestination = 'admin.html';
        console.log('User is admin - back will go to admin.html');
      } else {
        backDestination = 'categories.html';
        console.log('User is donor - back will go to categories.html');
      }
    } else {
      backDestination = 'categories.html';
      console.log('User document does not exist - back will go to categories.html');
    }
  } catch (err) {
    console.warn('Could not determine user role:', err);
    backDestination = 'categories.html';
  }
});
const newPass = document.getElementById("newPasswordInput");
const confirmPass = document.getElementById("confirmPasswordInput");
const changePassBtn = document.getElementById("changePasswordBtn");

let currentUid = null;

/* --------------------------
   LOAD USER PROFILE
----------------------------*/
async function loadUserProfile(user) {
  try {
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    let name = user.displayName || "User";
    let about = "";

    if (snap.exists()) {
      const data = snap.data();
      name = data.name || name;
      about = data.about || "";
    }

    displayName.textContent = name;
    nameInput.value = name;
    aboutInput.value = about;

    emailInput.value = user.email;
    displayEmail.textContent = user.email;

    avatar.textContent = name.charAt(0).toUpperCase();

  } catch (err) {
    console.error("Error loading profile:", err);
  }
}

/* --------------------------
   LOAD DONATION HISTORY
----------------------------*/
async function loadDonationHistory(uid) {
  donationHistory.innerHTML = `<p class="text-muted">Loading donations...</p>`;

  try {
    const donationsRef = collection(db, "donations");
    const q = query(
      donationsRef,
      where("userId", "==", uid),
      orderBy("createdAt", "desc")
    );

    const snap = await getDocs(q);

    if (snap.empty) {
      donationHistory.innerHTML =
        `<p class="text-muted">You have no donations yet.</p>`;
      return;
    }

    let html = `<ul class="list-group">`;

    snap.forEach((doc) => {
      const d = doc.data();
      const date = d.createdAt?.toDate().toLocaleString() || "Unknown date";
      const items = d.items?.map(i => `${i.qty} ${i.unit} ${i.name}`).join(", ") || "";

      html += `
        <li class="list-group-item">
          <strong>${d.category}</strong><br>
          <small>${date}</small><br>
          <span class="text-muted">${items}</span>
        </li>
      `;
    });

    html += `</ul>`;

    donationHistory.innerHTML = html;

  } catch (err) {
    console.error("Donation history error:", err);
    donationHistory.innerHTML = `<p class="text-danger">Error loading donations.</p>`;
  }
}

/* --------------------------
   AUTH LISTENER
----------------------------*/
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  currentUid = user.uid;

  await loadUserProfile(user);
  await loadDonationHistory(user.uid);
});

/* --------------------------
   SAVE PROFILE
----------------------------*/
saveBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return;

  const name = nameInput.value.trim();
  const about = aboutInput.value.trim();

  if (!name) return alert("Name is required.");

  try {
    const userRef = doc(db, "users", user.uid);

    await setDoc(userRef, {
      name,
      about,
      email: user.email,
      updatedAt: new Date()
    }, { merge: true });

    await updateProfile(user, { displayName: name });

    alert("Profile updated!");
    location.reload();
  } catch (err) {
    alert("Update failed: " + err.message);
  }
});

/* --------------------------
   CANCEL BUTTON
----------------------------*/
if (cancelBtn) {
  cancelBtn.addEventListener("click", (e) => {
    console.log('Cancel button clicked');
    goBack();
  });
}

/* --------------------------
   CHANGE PASSWORD
----------------------------*/
changePassBtn.addEventListener("click", async () => {
  const newPassword = newPass.value.trim();
  const confirm = confirmPass.value.trim();

  if (!newPassword || !confirm)
    return alert("Enter both password fields.");

  if (newPassword !== confirm)
    return alert("Passwords do not match.");

  try {
    const user = auth.currentUser;
    await updatePassword(user, newPassword);

    alert("Password updated!");
    newPass.value = "";
    confirmPass.value = "";

  } catch (err) {
    if (err.code === "auth/requires-recent-login") {
      alert("Please log in again to update your password.");
    } else {
      alert("Error: " + err.message);
    }
  }
});
