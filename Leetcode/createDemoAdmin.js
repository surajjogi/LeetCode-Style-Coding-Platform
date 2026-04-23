/**
 * Run this ONCE to create the demoAdmin account in your database.
 * Usage: node createDemoAdmin.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

async function createDemoAdmin() {
    await mongoose.connect(process.env.MONGO_STRING);
    
    const User = require('./src/models/user');

    const email    = 'demo@admin.com';      // ← share this publicly
    const password = 'Demo@1234';           // ← share this publicly
    const existing = await User.findOne({ emailId: email });

    if (existing) {
        console.log('✅ Demo admin already exists:', email);
        process.exit(0);
    }

    const hash = await bcrypt.hash(password, 10);
    await User.create({
        firstName: 'Demo',
        lastName:  'Admin',
        emailId:   email,
        password:  hash,
        role:      'demoAdmin',
    });

    console.log('✅ Demo admin created!');
    console.log('   Email   :', email);
    console.log('   Password:', password);
    console.log('   Role    : demoAdmin (read-only - cannot delete/create)');
    process.exit(0);
}

createDemoAdmin().catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
