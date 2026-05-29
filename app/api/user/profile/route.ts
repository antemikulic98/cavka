import { NextRequest, NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import { getCurrentUser } from '@/lib/auth';
import { csrfProtection } from '@/lib/csrf';
import User from '@/models/User';

// PATCH - Update user profile
export async function PATCH(request: NextRequest) {
  try {
    const csrfError = csrfProtection(request);
    if (csrfError) return csrfError;

    await connectMongoDB();

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { firstName, lastName } = body;

    // Validate input
    if (!firstName || !lastName || typeof firstName !== 'string' || typeof lastName !== 'string') {
      return NextResponse.json(
        { error: 'First name and last name are required' },
        { status: 400 }
      );
    }

    // Sanitize to prevent XSS
    const cleanFirst = firstName.trim().replace(/[<>"'&]/g, '');
    const cleanLast = lastName.trim().replace(/[<>"'&]/g, '');

    if (cleanFirst.length < 1 || cleanFirst.length > 100 || cleanLast.length < 1 || cleanLast.length > 100) {
      return NextResponse.json(
        { error: 'Name must be between 1 and 100 characters' },
        { status: 400 }
      );
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      currentUser.id,
      {
        first_name: cleanFirst,
        last_name: cleanLast,
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
