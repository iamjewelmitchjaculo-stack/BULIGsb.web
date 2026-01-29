#!/usr/bin/env node

/**
 * Verify Admin User Document
 * Checks if the admin user has the correct role in Firestore
 */

const admin = require('firebase-admin');
const path = require('path');

const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

try {
  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} catch (err) {
  console.error('❌ Error: Could not load service account key.');
  process.exit(1);
}

const db = admin.firestore();
const adminUid = 'ZZ2dgf2VQHN7oZW4UvarrrB6hyr2';

async function verify() {
  try {
    console.log(`\n🔍 Checking admin user document...`);
    
    const userDoc = await db.collection('users').doc(adminUid).get();
    
    if (!userDoc.exists) {
      console.error('❌ Admin user document does NOT exist at users/' + adminUid);
      console.log('\n   Creating admin user document now...');
      
      await db.collection('users').doc(adminUid).set({
        name: 'Admin01',
        email: 'buligsantabarbaralgu@gmail.com',
        role: 'admin',
        location: 'MDRRMO',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      
      console.log('✅ Admin user document created successfully!');
    } else {
      const data = userDoc.data();
      console.log('✅ Admin user document exists:');
      console.log('   UID:', adminUid);
      console.log('   Name:', data.name);
      console.log('   Email:', data.email);
      console.log('   Role:', data.role);
      console.log('   Location:', data.location);
      
      if (data.role !== 'admin') {
        console.error('\n❌ ERROR: Role is NOT "admin"!');
        console.log('   Fixing role now...');
        
        await db.collection('users').doc(adminUid).update({
          role: 'admin',
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        
        console.log('✅ Role updated to "admin"');
      }
    }
    
    console.log('\n✅ Verification complete! Admin should now have access to donations.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

verify();
