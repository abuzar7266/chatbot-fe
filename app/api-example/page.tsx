'use client';

import { useState } from 'react';
import { z } from 'zod';
import { UserApi, ProductApi } from '@/lib/api';
import { ApiSchemas } from '@/lib/api/api-definitions';
import { Button } from '@/components/ui';

type UserList = z.infer<typeof ApiSchemas.userList>;
type Product = z.infer<typeof ApiSchemas.product>;

export default function ApiExamplePage() {
  const [users, setUsers] = useState<UserList>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // User API examples
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await UserApi.getAll();
      setUsers(data);
    } catch (error) {
      const message =
        (error as { message?: string }).message || 'Failed to fetch users';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async () => {
    setLoading(true);
    setError(null);
    try {
      const newUser = await UserApi.create({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      });
      setUsers([...users, newUser]);
    } catch (error) {
      const message =
        (error as { message?: string }).message || 'Failed to create user';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Product API examples
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ProductApi.getAll();
      setProducts(data);
    } catch (error) {
      const message =
        (error as { message?: string }).message || 'Failed to fetch products';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async () => {
    setLoading(true);
    setError(null);
    try {
      const newProduct = await ProductApi.create({
        name: 'New Product',
        description: 'Product description',
        price: 99.99,
        stock: 10,
      });
      setProducts([...products, newProduct]);
    } catch (error) {
      const message =
        (error as { message?: string }).message || 'Failed to create product';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">API Example Page</h1>
      <p className="text-gray-600 mb-8">
        This page demonstrates the centralized API service with type-safe requests and responses.
      </p>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Users Section */}
        <div className="border rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Users API</h2>
          <div className="space-y-2 mb-4">
            <Button onClick={fetchUsers} disabled={loading}>
              Get All Users
            </Button>
            <Button onClick={createUser} disabled={loading} variant="secondary">
              Create User
            </Button>
          </div>
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Users ({users.length}):</h3>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-64">
              {JSON.stringify(users, null, 2)}
            </pre>
          </div>
        </div>

        {/* Products Section */}
        <div className="border rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Products API</h2>
          <div className="space-y-2 mb-4">
            <Button onClick={fetchProducts} disabled={loading}>
              Get All Products
            </Button>
            <Button onClick={createProduct} disabled={loading} variant="secondary">
              Create Product
            </Button>
          </div>
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Products ({products.length}):</h3>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-64">
              {JSON.stringify(products, null, 2)}
            </pre>
          </div>
        </div>
      </div>

      {loading && (
        <div className="mt-4 text-center text-gray-600">Loading...</div>
      )}
    </div>
  );
}

