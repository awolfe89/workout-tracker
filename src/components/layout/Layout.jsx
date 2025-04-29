import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import BottomNavigation from './BottomNavigation';

export default function Layout({ onLogout }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header onLogout={onLogout} />
      <main className="flex-grow px-4 max-w-4xl mx-auto w-full">
        <div className="pt-24 pb-24">
          <Outlet />
        </div>
      </main>
      <BottomNavigation />
    </div>
  );
}