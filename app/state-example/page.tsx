'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore, useAppStore, useUserStore } from '@/store';
import { useNotification } from '@/hooks';
import { Button } from '@/components/ui';

export default function StateExamplePage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { theme, setTheme, sidebarOpen, toggleSidebar } = useAppStore();
  const { users, isLoading, setUsers, addUser, removeUser } = useUserStore();
  const { notify } = useNotification();

  const handleLogin = () => {
    notify.info('Redirecting to login page');
    router.push('/login');
  };

  const handleLogout = () => {
    logout();
    notify.info('Logged out');
  };

  const handleAddUser = () => {
    const newUser = {
      id: Date.now().toString(),
      name: 'New User',
      email: 'newuser@example.com',
      createdAt: new Date().toISOString(),
    };
    addUser(newUser);
    notify.success('User added!');
  };

  const handleRemoveUser = (id: string) => {
    removeUser(id);
    notify.warning('User removed');
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">State Management Example</h1>
      <p className="text-gray-600 mb-8">
        This page demonstrates Zustand global state management.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Auth Store */}
        <div className="border rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Auth Store</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Status:</p>
              <p className="font-semibold">
                {isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}
              </p>
            </div>
            {user && (
              <div>
                <p className="text-sm text-gray-600">User:</p>
                <p className="font-semibold">{user.fullName || user.email}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            )}
            <div className="space-y-2">
              <Button onClick={handleLogin} disabled={isAuthenticated}>
                Login
              </Button>
              <Button onClick={handleLogout} disabled={!isAuthenticated} variant="secondary">
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* App Store */}
        <div className="border rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">App Store</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">Theme:</p>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
                className="w-full p-2 border rounded"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Sidebar:</p>
              <p className="font-semibold">
                {sidebarOpen ? '✅ Open' : '❌ Closed'}
              </p>
              <Button onClick={toggleSidebar} className="mt-2">
                Toggle Sidebar
              </Button>
            </div>
            <div>
              <Button
                onClick={() => notify.success('Success notification!')}
                variant="secondary"
                className="w-full mb-2"
              >
                Show Success
              </Button>
              <Button
                onClick={() => notify.error('Error notification!')}
                variant="secondary"
                className="w-full"
              >
                Show Error
              </Button>
            </div>
          </div>
        </div>

        {/* User Store */}
        <div className="border rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">User Store</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">
                Users: {users.length} {isLoading ? '(loading...)' : ''}
              </p>
            </div>
            <div className="space-y-2">
              <Button onClick={handleAddUser} className="w-full">
                Add User
              </Button>
              <Button
                onClick={() => setUsers([])}
                variant="secondary"
                className="w-full"
              >
                Clear All
              </Button>
            </div>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="p-2 bg-gray-100 rounded flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold text-sm">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveUser(user.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

