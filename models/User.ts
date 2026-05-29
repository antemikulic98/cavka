import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  fullName: string;
  comparePassword(password: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    first_name: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    last_name: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving + validate complexity
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    // SECURITY: Validate password complexity
    const password = this.password;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_\-+=]/.test(password);
    const isLongEnough = password.length >= 8;

    if (!isLongEnough) {
      return next(new Error('Password must be at least 8 characters long'));
    }

    if (!hasUpperCase) {
      return next(new Error('Password must contain at least one uppercase letter'));
    }

    if (!hasLowerCase) {
      return next(new Error('Password must contain at least one lowercase letter'));
    }

    if (!hasNumber) {
      return next(new Error('Password must contain at least one number'));
    }

    if (!hasSpecialChar) {
      return next(new Error('Password must contain at least one special character (!@#$%^&*(),.?":{}|<>_-+=)'));
    }

    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    throw new Error(String(error));
  }
};

// Get full name
UserSchema.virtual('fullName').get(function (this: IUser) {
  return `${this.first_name} ${this.last_name}`;
});

// Ensure virtual fields are serialized
UserSchema.set('toJSON', {
  virtuals: true,
});

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
