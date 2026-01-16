import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Mock data store (replace with actual database)
let users: Array<{
  id: string;
  name: string;
  email: string;
  createdAt: string;
}> = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    createdAt: new Date().toISOString(),
  },
];

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
});

// GET /api/users/[id] - Get user by ID
export async function GET(
  request: NextRequest,
  { params }: any
) {
  const user = users.find((u) => u.id === params.id);

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json(user);
}

// PUT /api/users/[id] - Update user
export async function PUT(
  request: NextRequest,
  { params }: any
) {
  try {
    const userIndex = users.findIndex((u) => u.id === params.id);

    if (userIndex === -1) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = updateUserSchema.parse(body);

    users[userIndex] = {
      ...users[userIndex],
      ...validatedData,
    };

    return NextResponse.json(users[userIndex]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: any
) {
  const userIndex = users.findIndex((u) => u.id === params.id);

  if (userIndex === -1) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  users.splice(userIndex, 1);

  return NextResponse.json({ success: true, message: 'User deleted' });
}

