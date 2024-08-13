const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

//defining the user schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    mobile: {
        type: String,
        required: true,
        unique: true
    },
    address: {
        type: String,
        required: true
    },
    aadharCardNumber: {
        type:Number,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['voter', 'admin'],
        default: 'voter'
    },
    isVoted: {
        type: Boolean,
        default: false
    }
});

userSchema.pre('save', async function(next) {
    const user = this;
    //has the password only if the password is new or modified
    if (!user.isModified('password')) return next();
    try {
        //hash password generation
        const salt = await bcrypt.genSalt(10);

        //has the password
        const hashedPassword = await bcrypt.hash(user.password, salt);

        //overriding the plain password with the hashed one
        user.password = hashedPassword;
        next();
    } catch (error) {
        return next(error);
    }
})

userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        //using bcrypt to compare the provided password with the hashed password
        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        return isMatch;
    } catch (error) {
        throw error;
    }
}

const User = mongoose.model('User', userSchema);

module.exports = User;