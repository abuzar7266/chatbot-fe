import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Mock data store (replace with actual database)
let users: Array<{
  id: string;
  name: string;
  email: string;
  createdAt: string;
}> = [];

const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

// GET /api/users - Get all users
export async function GET() {
  return NextResponse.json(users);
}

// POST /api/users - Create a new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createUserSchema.parse(body);

    const newUser = {
      id: Date.now().toString(),
      name: validatedData.name,
      email: validatedData.email,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);

    return NextResponse.json(newUser, { status: 201 });
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

