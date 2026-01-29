#!/usr/bin/env node

/**
 * Admin Setup Script
 * Run this once to create/update admin user document in Firestore
 * 
 * Usage: node setup-admin.js <email> <display-name>
 * Example: node setup-admin.js admin@example.com "Admin User"
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || 
  path.join(__dirname, 'serviceAccountKey.json');

try {
  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} catch (err) {
  console.error('❌ Error: Could not load service account key.');
  console.error('   Download it from Firebase Console → Project Settings → Service Accounts');
  console.error('   Save as: serviceAccountKey.json in the project root');
  process.exit(1);
}

const db = admin.firestore();
const auth = admin.auth();

async function setupAdmin() {
  const email = process.argv[2];
  const displayName = process.argv[3] || 'Admin';

  if (!email) {
    console.log('Usage: node setup-admin.js <email> [display-name]');
    console.log('Example: node setup-admin.js admin@example.com "Admin User"');
    process.exit(1);
  }

  try {
    console.log(`\n🔍 Looking up user with email: ${email}`);
    
    // Get user by email
    const user = await auth.getUserByEmail(email);
    const uid = user.uid;

    console.log(`✓ Found user: ${user.displayName || 'No name'} (${uid})`);
    console.log(`\n📝 Creating admin document in Firestore...`);

    // Create/update admin document
    await db.collection('users').doc(uid).set({
      name: user.displayName || displayName,
      email: user.email,
      role: 'admin',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    console.log(`✅ Admin setup complete!`);
    console.log(`\n   User UID: ${uid}`);
    console.log(`   Email: ${email}`);
    console.log(`   Role: admin`);
    console.log(`\n   You can now log in to the admin dashboard at: /admin.html`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

setupAdmin();
