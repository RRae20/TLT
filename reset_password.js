const { User } = require('./config/db');
const bcrypt = require('bcrypt');
require('dotenv').config();
const mongoose = require('mongoose');

async function resetPassword() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
        
        const user = await User.findOne({ email: 'jerald.cruz2749@gmail.com' });
        if (user) {
            const hashedPassword = await bcrypt.hash('citizen123', 10);
            await User.updateOne({ _id: user._id }, { password: hashedPassword });
            console.log('Password reset successfully for:', user.email);
            console.log('New password: citizen123');
        } else {
            console.log('User not found');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

resetPassword();