// src/components/layout/Layout.jsx
import Header from './Header';
import BottomNavigation from './BottomNavigation';

// src/components/layout/Layout.jsx
export default function Layout({ children, onLogout }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16">
      <Header onLogout={onLogout} />
      <main className="max-w-xl mx-auto pt-20 px-4">
        <div className="py-4">
          {children}
        </div>
      </main>
      <BottomNavigation />
      <footer className="bg-white dark:bg-gray-800 shadow-inner mt-8 py-4 px-4 text-center text-sm text-gray-500 dark:text-gray-400">
        WorkoutTracker &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}