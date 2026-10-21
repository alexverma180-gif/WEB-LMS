/**
 * dashboard.js - Home Page Controller
 * Library Management System (LMS)
 */

document.addEventListener('DOMContentLoaded', () => {
  // Update dashboard date
  updateDashboardDate();
  
  // Render Dashboard
  renderDashboard();

  // Listen to role changes
  window.addEventListener('roleChanged', () => {
    renderDashboard();
  });
});

function updateDashboardDate() {
  const dateEl = document.getElementById('dashboardDate');
  if (dateEl) {
    const today = new Date();
    dateEl.textContent = today.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}

function renderDashboard() {
  const role = getRole();
  const books = getBooks();
  const members = getMembers();
  const transactions = getTransactions();

  // 1. Welcome Card Text & Actions
  const userNameEl = document.getElementById('welcomeUserName');
  const userMessageEl = document.getElementById('welcomeMessage');
  const primaryActionEl = document.getElementById('welcomePrimaryAction');

  if (role === 'Admin') {
    if (userNameEl) userNameEl.textContent = 'Admin Librarian';
    if (userMessageEl) {
      userMessageEl.textContent = 'Here is your overview of today\'s library operations. You can manage books, register members, record borrow transactions, and view detailed library logs.';
    }
    if (primaryActionEl) {
      primaryActionEl.href = 'transactions.html';
      primaryActionEl.innerHTML = '<i data-lucide="plus-circle"></i> <span>Issue Book</span>';
    }
  } else {
    if (userNameEl) userNameEl.textContent = 'Valued Library Member';
    if (userMessageEl) {
      userMessageEl.textContent = 'Browse our extensive library collection, check availability of titles, and view your personal borrow history or active rentals from your digital card.';
    }
    if (primaryActionEl) {
      primaryActionEl.href = 'books.html';
      primaryActionEl.innerHTML = '<i data-lucide="book-open"></i> <span>Browse Catalogue</span>';
    }
  }

  // 2. Metrics calculation
  const totalBooks = books.length;
  const availableCopies = books.reduce((sum, book) => sum + book.available, 0);
  const totalMembers = members.length;
  const overdueCopies = transactions.filter(t => t.status === 'Overdue' && !t.returnDate).length;

  // Update elements
  const elTotal = document.getElementById('statTotalBooks');
  const elAvail = document.getElementById('statAvailableBooks');
  const elMembers = document.getElementById('statTotalMembers');
  const elOverdue = document.getElementById('statOverdueBooks');

  if (elTotal) elTotal.textContent = totalBooks;
  if (elAvail) elAvail.textContent = availableCopies;
  if (elMembers) elMembers.textContent = totalMembers;
  if (elOverdue) elOverdue.textContent = overdueCopies;

  // 3. Recent Activity Ticker
  const activityList = document.getElementById('recentActivityList');
  if (activityList) {
    activityList.innerHTML = '';
    
    // Sort transactions by date descending (using custom sorting of transaction list)
    const sortedTrans = [...transactions].sort((a, b) => {
      // Prioritize issueDate
      return new Date(b.issueDate) - new Date(a.issueDate);
    });

    // Display top 5
    const topTrans = sortedTrans.slice(0, 5);

    if (topTrans.length === 0) {
      activityList.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 2rem;">No recent activities found.</td></tr>`;
    } else {
      topTrans.forEach(t => {
        const tr = document.createElement('tr');
        
        let statusBadge = '';
        if (t.status === 'Issued') {
          statusBadge = `<span class="badge badge-primary">Issued</span>`;
        } else if (t.status === 'Overdue') {
          statusBadge = `<span class="badge badge-danger">Overdue</span>`;
        } else if (t.status === 'Returned') {
          statusBadge = `<span class="badge badge-success">Returned</span>`;
        }

        const transDate = t.returnDate ? t.returnDate : t.issueDate;
        const actionLabel = t.returnDate ? 'Returned' : 'Issued';

        tr.innerHTML = `
          <td style="font-weight: 600;">${t.memberName}</td>
          <td>
            <div style="font-weight: 500;">${t.bookTitle}</div>
            <span style="font-size: 0.75rem; color: var(--text-muted);">${actionLabel}</span>
          </td>
          <td>${utils.formatDate(transDate)}</td>
          <td>${statusBadge}</td>
        `;
        activityList.appendChild(tr);
      });
    }
  }

  // 4. Quick Actions
  const actionsGrid = document.getElementById('quickActionsGrid');
  if (actionsGrid) {
    actionsGrid.innerHTML = '';
    
    let actions = [];
    if (role === 'Admin') {
      actions = [
        {
          title: 'Catalog Management',
          desc: 'Add, update, or remove books from directory.',
          icon: 'plus',
          link: 'books.html?action=new',
          color: 'var(--primary)'
        },
        {
          title: 'Register Member',
          desc: 'Add new library readers to system database.',
          icon: 'user-plus',
          link: 'members.html?action=new',
          color: 'var(--secondary)'
        },
        {
          title: 'Perform Book Transaction',
          desc: 'Issue books or process reader returns.',
          icon: 'arrow-left-right',
          link: 'transactions.html',
          color: 'var(--success)'
        },
        {
          title: 'Analytics Reports',
          desc: 'Check inventory and overdue borrowing graphs.',
          icon: 'bar-chart-3',
          link: 'reports.html',
          color: 'var(--warning)'
        }
      ];
    } else {
      actions = [
        {
          title: 'Browse Catalogue',
          desc: 'Look through shelf books and check availability.',
          icon: 'book-open',
          link: 'books.html',
          color: 'var(--primary)'
        },
        {
          title: 'My Borrow History',
          desc: 'View your checked-out books and due dates.',
          icon: 'history',
          link: 'transactions.html',
          color: 'var(--success)'
        },
        {
          title: 'Library Statistics',
          desc: 'Explore general library statistics and popular categories.',
          icon: 'pie-chart',
          link: 'reports.html',
          color: 'var(--warning)'
        }
      ];
    }

    actions.forEach(act => {
      const a = document.createElement('a');
      a.href = act.link;
      a.className = 'btn btn-secondary';
      a.style.display = 'flex';
      a.style.alignItems = 'center';
      a.style.justifyContent = 'flex-start';
      a.style.textAlign = 'left';
      a.style.padding = '1rem';
      a.style.border = '1px solid var(--border-color)';
      a.style.gap = '1rem';
      a.style.borderRadius = 'var(--radius-md)';
      a.style.transition = 'all var(--transition-fast)';

      a.innerHTML = `
        <div style="width: 42px; height: 42px; border-radius: var(--radius-sm); background-color: var(--bg-primary); display: flex; align-items: center; justify-content: center; color: ${act.color}; font-size: 1.2rem;">
          <i data-lucide="${act.icon}"></i>
        </div>
        <div style="flex-grow: 1;">
          <div style="font-weight: 700; font-size: 0.95rem; color: var(--text-primary);">${act.title}</div>
          <div style="font-size: 0.8rem; color: var(--text-secondary); font-weight: 400; margin-top: 0.15rem;">${act.desc}</div>
        </div>
        <i data-lucide="chevron-right" style="color: var(--text-muted); width: 16px; height: 16px;"></i>
      `;
      actionsGrid.appendChild(a);
    });
  }

  // Re-run Lucide SVG renderer
  if (window.lucide) {
    window.lucide.createIcons();
  }
}
