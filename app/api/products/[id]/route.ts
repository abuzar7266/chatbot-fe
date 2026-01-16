import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Mock data store (replace with actual database)
let products: Array<{
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
}> = [
  {
    id: '1',
    name: 'Sample Product',
    description: 'This is a sample product',
    price: 99.99,
    stock: 10,
  },
];

const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  stock: z.number().int().nonnegative().optional(),
});

// GET /api/products/[id] - Get product by ID
export async function GET(
  request: NextRequest,
  { params }: any
) {
  const product = products.find((p) => p.id === params.id);

  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  return NextResponse.json(product);
}

// PATCH /api/products/[id] - Update product
export async function PATCH(
  request: NextRequest,
  { params }: any
) {
  try {
    const productIndex = products.findIndex((p) => p.id === params.id);

    if (productIndex === -1) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = updateProductSchema.parse(body);

    products[productIndex] = {
      ...products[productIndex],
      ...validatedData,
    };

    return NextResponse.json(products[productIndex]);
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

// DELETE /api/products/[id] - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: any
) {
  const productIndex = products.findIndex((p) => p.id === params.id);

  if (productIndex === -1) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  products.splice(productIndex, 1);

  return NextResponse.json({ success: true, message: 'Product deleted' });
}

