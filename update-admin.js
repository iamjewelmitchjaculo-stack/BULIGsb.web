#!/usr/bin/env node

/**
 * Update Admin Email and Password
 * Usage: node update-admin.js <newEmail> <newPassword>
 * Example: node update-admin.js newemail@gmail.com NewPassword123!
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

try {
  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} catch (err) {
  console.error('❌ Error: Could not load service account key.');
  console.error('   Make sure serviceAccountKey.json exists in the project root');
  process.exit(1);
}

const auth = admin.auth();
const db = admin.firestore();

async function updateAdmin() {
  const newEmail = process.argv[2];
  const newPassword = process.argv[3];
  const adminUid = 'ZZ2dgf2VQHN7oZW4UvarrrB6hyr2'; // Your admin UID

  if (!newEmail || !newPassword) {
    console.log('Usage: node update-admin.js <newEmail> <newPassword>');
    console.log('Example: node update-admin.js admin@example.com NewPassword123!');
    process.exit(1);
  }

  try {
    console.log(`\n🔍 Updating admin account (UID: ${adminUid})...`);
    
    // Update auth email and password
    console.log(`📝 Updating email to: ${newEmail}`);
    await auth.updateUser(adminUid, {
      email: newEmail,
      password: newPassword
    });

    console.log(`✓ Auth email and password updated`);
    
    // Update Firestore user document
    console.log(`📝 Updating Firestore user document...`);
    await db.collection('users').doc(adminUid).set({
      email: newEmail,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    console.log(`✅ Admin account updated successfully!`);
    console.log(`\n   UID: ${adminUid}`);
    console.log(`   New Email: ${newEmail}`);
    console.log(`   New Password: ${newPassword}`);
    console.log(`\n   You can now log in to the admin dashboard with these credentials.`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

updateAdmin();
