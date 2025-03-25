import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('student');

  const studentNavLinks = [
    { to: '/student/dashboard', label: 'Dashboard' },
    { to: '/student/myExams', label: 'My Exams' },
    { to: '/student/results', label: 'Results' },
    { to: '/student/profile', label: 'Profile' },
  ];

  const universityNavLinks = [
    { to: '/university/dashboard', label: 'Dashboard' },
    { to: '/university/exams', label: 'Examinations' },
    { to: '/university/departments', label: 'Departments' },
    { to: '/university/reports', label: 'Reports' },
  ];

  const guestNavLinks = [
    { to: '/student/login', label: 'Student Login' },
    { to: '/university/login', label: 'University Login' },
  ];

  useEffect(() => {
    const user = localStorage.getItem("examUser");
    if (user) {
      setIsLoggedIn(true);
      setUserRole(user);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("examUser");
    setIsLoggedIn(false);
    window.location.href = '/';
  }

  const navLinks = isLoggedIn
    ? userRole === 'student'
      ? studentNavLinks
      : universityNavLinks
    : guestNavLinks;

  return (
    <nav className="bg-white shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link 
              to="/" 
              className="text-green-600 text-lg font-semibold hover:text-green-700 transition-colors duration-200"
            >
              Exam Portal
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-6 flex items-center space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-gray-700 hover:text-green-600 px-2 py-1 text-sm font-medium relative group transition-all duration-200"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-400 group-hover:w-full transition-all duration-300"></span>
                </Link>
              ))}
              {isLoggedIn && (
                <button
                  className="text-gray-700 hover:text-white hover:bg-green-600 px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 border border-green-600"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-1 rounded-md text-gray-600 hover:text-green-600 focus:outline-none transition-colors duration-200"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-md">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-gray-700 hover:bg-green-50 hover:text-green-600 block px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
            {isLoggedIn && (
              <button
                className="text-gray-700 hover:bg-green-50 hover:text-green-600 block px-3 py-2 rounded-md text-sm font-medium w-full text-left transition-colors duration-200"
                onClick={handleLogout}
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;