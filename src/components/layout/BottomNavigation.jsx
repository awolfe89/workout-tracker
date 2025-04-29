import React from 'react';
import { NavLink } from 'react-router-dom';
import useKeyboardVisible from '../../hooks/useKeyboardVisible';

export default function BottomNavigation() {
  const isKeyboardVisible = useKeyboardVisible();
  
  if (isKeyboardVisible) return null;
  
  return (
    <nav className="fixed bottom-0 w-full bg-white border-t flex justify-around p-2 z-30 dark:bg-gray-800 dark:border-gray-700 shadow-lg">
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          `flex flex-col items-center pt-1 ${isActive ? 'text-blue-600 font-medium' : 'text-gray-600 dark:text-gray-300'}`
        }
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span className="text-xs mt-1">Workouts</span>
      </NavLink>
      <NavLink
        to="/stats"
        className={({ isActive }) =>
          `flex flex-col items-center pt-1 ${isActive ? 'text-blue-600 font-medium' : 'text-gray-600 dark:text-gray-300'}`
        }
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <span className="text-xs mt-1">Progress</span>
      </NavLink>
      <NavLink
        to="/schedule"
        className={({ isActive }) =>
          `flex flex-col items-center pt-1 ${isActive ? 'text-blue-600 font-medium' : 'text-gray-600 dark:text-gray-300'}`
        }
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="text-xs mt-1">Schedule</span>
      </NavLink>
      <NavLink
        to="/settings"
        className={({ isActive }) =>
          `flex flex-col items-center pt-1 ${isActive ? 'text-blue-600 font-medium' : 'text-gray-600 dark:text-gray-300'}`
        }
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className="text-xs mt-1">Settings</span>
      </NavLink>
    </nav>
  );
}