import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Mock data store (replace with actual database)
let products: Array<{
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
}> = [];

const createProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  stock: z.number().int().nonnegative(),
});

// GET /api/products - Get all products
export async function GET() {
  return NextResponse.json(products);
}

// POST /api/products - Create a new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createProductSchema.parse(body);

    const newProduct = {
      id: Date.now().toString(),
      ...validatedData,
    };

    products.push(newProduct);

    return NextResponse.json(newProduct, { status: 201 });
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

