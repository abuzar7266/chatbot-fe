import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface UserState {
  users: User[];
  selectedUser: User | null;
  isLoading: boolean;
  error: string | null;
  setUsers: (users: User[]) => void;
  addUser: (user: User) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  removeUser: (id: string) => void;
  setSelectedUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useUserStore = create<UserState>()(
  devtools(
    (set) => ({
      users: [],
      selectedUser: null,
      isLoading: false,
      error: null,

      setUsers: (users) => {
        set({ users, error: null });
      },

      addUser: (user) => {
        set((state) => ({
          users: [...state.users, user],
          error: null,
        }));
      },

      updateUser: (id, userData) => {
        set((state) => ({
          users: state.users.map((user) =>
            user.id === id ? { ...user, ...userData } : user
          ),
          selectedUser:
            state.selectedUser?.id === id
              ? { ...state.selectedUser, ...userData }
              : state.selectedUser,
          error: null,
        }));
      },

      removeUser: (id) => {
        set((state) => ({
          users: state.users.filter((user) => user.id !== id),
          selectedUser: state.selectedUser?.id === id ? null : state.selectedUser,
          error: null,
        }));
      },

      setSelectedUser: (user) => {
        set({ selectedUser: user });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setError: (error) => {
        set({ error, isLoading: false });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'user-store', // Name for Redux DevTools
    }
  )
);

