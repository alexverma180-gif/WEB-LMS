/**
 * core.js - Shared Core Logic & State Management
 * Library Management System (LMS)
 */

// Local Storage Keys
const STORAGE_KEYS = {
  BOOKS: 'lms_books',
  MEMBERS: 'lms_members',
  TRANSACTIONS: 'lms_transactions',
  THEME: 'lms_theme',
  ROLE: 'lms_role'
};

// Seed Data
const SEED_BOOKS = [
  {
    id: 'b1',
    title: 'Clean Code',
    author: 'Robert C. Martin',
    isbn: '978-0132350884',
    category: 'Computers',
    publishedYear: 2008,
    copies: 5,
    available: 4,
    location: 'Shelf A-3',
    coverImageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'b2',
    title: 'The Pragmatic Programmer',
    author: 'Andy Hunt & Dave Thomas',
    isbn: '978-0135957059',
    category: 'Computers',
    publishedYear: 2019,
    copies: 3,
    available: 2,
    location: 'Shelf A-4',
    coverImageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'b3',
    title: 'A Brief History of Time',
    author: 'Stephen Hawking',
    isbn: '978-0553380163',
    category: 'Science',
    publishedYear: 1998,
    copies: 4,
    available: 4,
    location: 'Shelf B-1',
    coverImageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'b4',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    isbn: '978-0743273565',
    category: 'Fiction',
    publishedYear: 1925,
    copies: 6,
    available: 4,
    location: 'Shelf C-2',
    coverImageUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'b5',
    title: 'Sapiens: A Brief History of Humankind',
    author: 'Yuval Noah Harari',
    isbn: '978-0062316097',
    category: 'History',
    publishedYear: 2015,
    copies: 4,
    available: 3,
    location: 'Shelf D-1',
    coverImageUrl: 'https://images.unsplash.com/photo-1447069387593-a5de0862481e?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'b6',
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    isbn: '978-0374275631',
    category: 'Psychology',
    publishedYear: 2011,
    copies: 3,
    available: 3,
    location: 'Shelf E-2',
    coverImageUrl: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'b7',
    title: 'Design Patterns',
    author: 'Erich Gamma et al.',
    isbn: '978-0201633610',
    category: 'Computers',
    publishedYear: 1994,
    copies: 2,
    available: 2,
    location: 'Shelf A-2',
    coverImageUrl: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'b8',
    title: 'Educated',
    author: 'Tara Westover',
    isbn: '978-0399590504',
    category: 'Biography',
    publishedYear: 2018,
    copies: 3,
    available: 2,
    location: 'Shelf F-1',
    coverImageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'b9',
    title: 'Principles: Life and Work',
    author: 'Ray Dalio',
    isbn: '978-1501124020',
    category: 'Business',
    publishedYear: 2017,
    copies: 5,
    available: 5,
    location: 'Shelf G-3',
    coverImageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80'
  }
];

const SEED_MEMBERS = [
  {
    id: 'm1',
    name: 'Alex Johnson',
    email: 'alex.j@example.com',
    phone: '555-0199',
    role: 'Admin',
    joinedDate: '2025-01-10',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80'
  },
  {
    id: 'm2',
    name: 'Sarah Miller',
    email: 'sarah.m@example.com',
    phone: '555-0143',
    role: 'Member',
    joinedDate: '2025-03-15',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80'
  },
  {
    id: 'm3',
    name: 'David Chen',
    email: 'david.c@example.com',
    phone: '555-0182',
    role: 'Member',
    joinedDate: '2025-05-22',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80'
  },
  {
    id: 'm4',
    name: 'Emily Taylor',
    email: 'emily.t@example.com',
    phone: '555-0165',
    role: 'Member',
    joinedDate: '2025-06-01',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80'
  }
];

// Helper to construct date strings relative to current date
function getRelativeDateString(daysOffset) {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split('T')[0];
}

const SEED_TRANSACTIONS = [
  {
    id: 't1',
    bookId: 'b4',
    bookTitle: 'The Great Gatsby',
    memberId: 'm2',
    memberName: 'Sarah Miller',
    issueDate: getRelativeDateString(-7),
    dueDate: getRelativeDateString(7), // due today
    returnDate: null,
    status: 'Issued'
  },
  {
    id: 't2',
    bookId: 'b5',
    bookTitle: 'Sapiens: A Brief History of Humankind',
    memberId: 'm3',
    memberName: 'David Chen',
    issueDate: getRelativeDateString(-20),
    dueDate: getRelativeDateString(-6), // overdue
    returnDate: null,
    status: 'Overdue'
  },
  {
    id: 't3',
    bookId: 'b1',
    bookTitle: 'Clean Code',
    memberId: 'm3',
    memberName: 'David Chen',
    issueDate: getRelativeDateString(-15),
    dueDate: getRelativeDateString(-1),
    returnDate: getRelativeDateString(-2), // returned on time
    status: 'Returned'
  },
  {
    id: 't4',
    bookId: 'b2',
    bookTitle: 'The Pragmatic Programmer',
    memberId: 'm2',
    memberName: 'Sarah Miller',
    issueDate: getRelativeDateString(-5),
    dueDate: getRelativeDateString(9),
    returnDate: null,
    status: 'Issued'
  },
  {
    id: 't5',
    bookId: 'b8',
    bookTitle: 'Educated',
    memberId: 'm4',
    memberName: 'Emily Taylor',
    issueDate: getRelativeDateString(-12),
    dueDate: getRelativeDateString(2),
    returnDate: null,
    status: 'Issued'
  }
];

// Initialise DB
function initDatabase() {
  if (!localStorage.getItem(STORAGE_KEYS.BOOKS)) {
    localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(SEED_BOOKS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.MEMBERS)) {
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(SEED_MEMBERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(SEED_TRANSACTIONS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.THEME)) {
    localStorage.setItem(STORAGE_KEYS.THEME, 'light');
  }
  if (!localStorage.getItem(STORAGE_KEYS.ROLE)) {
    localStorage.setItem(STORAGE_KEYS.ROLE, 'Admin');
  }
  
  // Re-verify transaction overdue statuses based on current date
  updateOverdueTransactions();
}

function updateOverdueTransactions() {
  const transactions = getTransactions();
  const today = new Date().toISOString().split('T')[0];
  let updated = false;
  
  transactions.forEach(t => {
    if (!t.returnDate && t.dueDate < today && t.status !== 'Overdue') {
      t.status = 'Overdue';
      updated = true;
    }
  });
  
  if (updated) {
    saveTransactions(transactions);
  }
}

// Data Getters & Setters
function getBooks() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKS)) || [];
}

function saveBooks(books) {
  localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(books));
}

function getMembers() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.MEMBERS)) || [];
}

function saveMembers(members) {
  localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
}

function getTransactions() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) || [];
}

function saveTransactions(transactions) {
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
}

function getTheme() {
  return localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
}

function setTheme(theme) {
  localStorage.setItem(STORAGE_KEYS.THEME, theme);
  document.documentElement.setAttribute('data-theme', theme);
  
  // Update Theme Icon visually if button exists
  const themeBtn = document.getElementById('themeToggleBtn');
  if (themeBtn) {
    themeBtn.innerHTML = theme === 'dark' ? '<i class="lucide-sun"></i>' : '<i class="lucide-moon"></i>';
    // Re-initialize lucide icons inside the button
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }
}

function getRole() {
  return localStorage.getItem(STORAGE_KEYS.ROLE) || 'Admin';
}

function setRole(role) {
  localStorage.setItem(STORAGE_KEYS.ROLE, role);
  applyRoleUI(role);
  
  // Fire custom event so page-specific scripts can refresh layout
  const event = new CustomEvent('roleChanged', { detail: { role } });
  window.dispatchEvent(event);
  
  showToast(`Switched view to: ${role}`, 'info');
}

// Core UI functions
function applyRoleUI(role) {
  // Apply role class indicator to body
  document.body.setAttribute('data-role', role.toLowerCase());
  
  // Show / Hide admin only elements
  const adminOnlyElements = document.querySelectorAll('.admin-only');
  adminOnlyElements.forEach(el => {
    if (role === 'Admin') {
      el.style.display = '';
    } else {
      el.style.display = 'none';
    }
  });
  
  // Hide pages completely restricted to Admin
  const isPageAdminOnly = document.body.classList.contains('admin-page');
  if (isPageAdminOnly && role !== 'Admin') {
    // Member shouldn't be here, redirect to dashboard
    showToast('Access Denied: Admin view only', 'error');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1500);
  }
  
  // Update sidebar footer profile badge
  const profileBadge = document.querySelector('.user-profile-badge');
  if (profileBadge) {
    const avatar = role === 'Admin' ? SEED_MEMBERS[0].avatarUrl : SEED_MEMBERS[1].avatarUrl;
    const name = role === 'Admin' ? SEED_MEMBERS[0].name : SEED_MEMBERS[1].name;
    
    profileBadge.innerHTML = `
      <img src="${avatar}" alt="${name}" class="user-avatar" />
      <div class="user-info">
        <span class="user-name">${name}</span>
        <span class="user-role-tag">${role}</span>
      </div>
    `;
  }
}

// Toast Notifications
function showToast(message, type = 'info') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let iconName = 'info';
  if (type === 'success') iconName = 'check-circle';
  if (type === 'error') iconName = 'alert-triangle';
  if (type === 'warning') iconName = 'alert-circle';
  
  toast.innerHTML = `
    <i class="toast-icon lucide-${iconName}"></i>
    <span class="toast-message">${message}</span>
    <span class="toast-close">&times;</span>
  `;
  
  container.appendChild(toast);
  
  // Trigger transition
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);
  
  // Close handler
  const closeBtn = toast.querySelector('.toast-close');
  closeBtn.addEventListener('click', () => {
    closeToast(toast);
  });
  
  // Auto-remove after 4 seconds
  const timeoutId = setTimeout(() => {
    closeToast(toast);
  }, 4000);
  
  toast.dataset.timeoutId = timeoutId;
  
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function closeToast(toast) {
  toast.classList.remove('show');
  clearTimeout(toast.dataset.timeoutId);
  setTimeout(() => {
    toast.remove();
  }, 300);
}

// Common Initialization
document.addEventListener('DOMContentLoaded', () => {
  initDatabase();
  
  // Set theme from local storage
  const currentTheme = getTheme();
  setTheme(currentTheme);
  
  // Set role switcher functionality
  const roleSelect = document.getElementById('headerRoleSelect');
  if (roleSelect) {
    roleSelect.value = getRole();
    roleSelect.addEventListener('change', (e) => {
      setRole(e.target.value);
    });
  }
  
  // Apply visual roles elements
  applyRoleUI(getRole());
  
  // Theme Toggle Button click handler
  const themeToggle = document.getElementById('themeToggleBtn');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const targetTheme = getTheme() === 'light' ? 'dark' : 'light';
      setTheme(targetTheme);
    });
  }
  
  // Mobile Navigation toggle handler
  const mobileToggle = document.getElementById('mobileMenuToggle');
  const sidebar = document.getElementById('appSidebar');
  
  if (mobileToggle && sidebar) {
    mobileToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      const isOpen = sidebar.classList.contains('open');
      mobileToggle.innerHTML = isOpen ? '<i class="lucide-x"></i>' : '<i class="lucide-menu"></i>';
      if (window.lucide) {
        window.lucide.createIcons();
      }
    });
    
    // Close sidebar if user clicks outside on mobile view
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 1024 && 
          !sidebar.contains(e.target) && 
          !mobileToggle.contains(e.target) && 
          sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
        mobileToggle.innerHTML = '<i class="lucide-menu"></i>';
        if (window.lucide) {
          window.lucide.createIcons();
        }
      }
    });
  }
  
  // Initialise Lucide icons
  if (window.lucide) {
    window.lucide.createIcons();
  }
});

// Helper utilities
const utils = {
  uuid: function() {
    return 'u_' + Math.random().toString(36).substr(2, 9);
  },
  formatDate: function(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },
  getDaysRemaining: function(dateStr) {
    const today = new Date();
    today.setHours(0,0,0,0);
    const target = new Date(dateStr);
    target.setHours(0,0,0,0);
    const diffTime = target - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
};
