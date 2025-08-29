import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true 
  },
  email: {
    type: String,
    required: true,
    unique: true 
  },
  phoneNumber: { 
    type: String
  },
  password: {
    type: String,
    required: true
  }
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);

