/**
 * transactions.js - Transaction Controller (Issue, Return, Renew)
 * Library Management System (LMS)
 */

document.addEventListener('DOMContentLoaded', () => {
  // Set default due date (14 days from now)
  const dueDateInput = document.getElementById('issueDueDate');
  if (dueDateInput) {
    const defaultDueDate = new Date();
    defaultDueDate.setDate(defaultDueDate.getDate() + 14);
    dueDateInput.value = defaultDueDate.toISOString().split('T')[0];
    // Prevent selecting past dates
    dueDateInput.min = new Date().toISOString().split('T')[0];
  }

  // Setup Autocomplete inputs
  setupAutocomplete();

  // Bind forms & filters
  const issueForm = document.getElementById('issueBookForm');
  const transSearch = document.getElementById('transSearchInput');
  const transFilter = document.getElementById('transStatusFilter');

  if (issueForm) issueForm.addEventListener('submit', handleIssueSubmit);
  if (transSearch) transSearch.addEventListener('input', renderTransactions);
  if (transFilter) transFilter.addEventListener('change', renderTransactions);

  // Initial render
  renderTransactions();

  // Listen to Role swaps
  window.addEventListener('roleChanged', () => {
    renderTransactions();
  });
});

// Autocomplete logic for Member and Book fields
function setupAutocomplete() {
  const memberInput = document.getElementById('issueMemberInput');
  const memberHidden = document.getElementById('selectedMemberId');
  const memberList = document.getElementById('memberAutocompleteList');

  const bookInput = document.getElementById('issueBookInput');
  const bookHidden = document.getElementById('selectedBookId');
  const bookList = document.getElementById('bookAutocompleteList');

  if (!memberInput || !bookInput) return;

  // Member Autocomplete
  memberInput.addEventListener('input', (e) => {
    const val = e.target.value.toLowerCase().trim();
    memberHidden.value = ''; // clear hidden ID as user typed manually
    memberList.innerHTML = '';
    
    if (!val) {
      memberList.classList.remove('active');
      return;
    }

    const members = getMembers();
    const matches = members.filter(m => m.name.toLowerCase().includes(val) || m.email.toLowerCase().includes(val));

    if (matches.length === 0) {
      memberList.classList.remove('active');
      return;
    }

    memberList.classList.add('active');
    matches.forEach(m => {
      const item = document.createElement('div');
      item.className = 'autocomplete-item';
      item.innerHTML = `
        <div style="font-weight: 600;">${m.name}</div>
        <div style="font-size: 0.75rem; color: var(--text-muted);">${m.email} (${m.role})</div>
      `;
      item.addEventListener('click', () => {
        memberInput.value = m.name;
        memberHidden.value = m.id;
        memberList.innerHTML = '';
        memberList.classList.remove('active');
      });
      memberList.appendChild(item);
    });
  });

  // Book Autocomplete
  bookInput.addEventListener('input', (e) => {
    const val = e.target.value.toLowerCase().trim();
    bookHidden.value = ''; // clear hidden ID
    bookList.innerHTML = '';

    if (!val) {
      bookList.classList.remove('active');
      return;
    }

    const books = getBooks();
    // Only display books that are in stock
    const matches = books.filter(b => 
      b.available > 0 && 
      (b.title.toLowerCase().includes(val) || b.author.toLowerCase().includes(val) || b.isbn.includes(val))
    );

    if (matches.length === 0) {
      bookList.classList.remove('active');
      return;
    }

    bookList.classList.add('active');
    matches.forEach(b => {
      const item = document.createElement('div');
      item.className = 'autocomplete-item';
      item.innerHTML = `
        <div style="font-weight: 600;">${b.title}</div>
        <div style="font-size: 0.75rem; color: var(--text-muted);">by ${b.author} | Copies Available: ${b.available}</div>
      `;
      item.addEventListener('click', () => {
        bookInput.value = b.title;
        bookHidden.value = b.id;
        bookList.innerHTML = '';
        bookList.classList.remove('active');
      });
      bookList.appendChild(item);
    });
  });

  // Close lists on clicking outside
  document.addEventListener('click', (e) => {
    if (!memberInput.contains(e.target) && !memberList.contains(e.target)) {
      memberList.classList.remove('active');
    }
    if (!bookInput.contains(e.target) && !bookList.contains(e.target)) {
      bookList.classList.remove('active');
    }
  });
}

// Render Transactions Table
function renderTransactions() {
  const role = getRole();
  const wrapper = document.getElementById('transactionsLayoutWrapper');
  const issuePanel = document.getElementById('issueFormPanel');
  const tableBody = document.getElementById('transactionsTableBody');
  const listTitle = document.getElementById('transListTitle');

  if (!tableBody) return;

  // 1. Structural Adjustments by Role
  if (role === 'Admin') {
    if (wrapper) {
      wrapper.className = 'content-grid-2';
    }
    if (issuePanel) {
      issuePanel.style.display = 'block';
    }
    if (listTitle) listTitle.textContent = 'Operational Transactions Log';
  } else {
    if (wrapper) {
      wrapper.className = ''; // remove 2 column grid
    }
    if (issuePanel) {
      issuePanel.style.display = 'none';
    }
    if (listTitle) listTitle.textContent = 'My Personal Borrow History';
  }

  // 2. Data Filtering
  let transactions = getTransactions();

  // If Member role, filter logs to only show Sarah Miller (m2)
  if (role !== 'Admin') {
    const memberSarahId = 'm2'; // default member
    transactions = transactions.filter(t => t.memberId === memberSarahId);
  }

  // Text search filtering (Matches book title or member name)
  const searchQuery = document.getElementById('transSearchInput')?.value.toLowerCase().trim() || '';
  if (searchQuery) {
    transactions = transactions.filter(t => 
      t.bookTitle.toLowerCase().includes(searchQuery) || 
      t.memberName.toLowerCase().includes(searchQuery) ||
      t.id.includes(searchQuery)
    );
  }

  // Status Filter (active: has no returnDate)
  const statusFilter = document.getElementById('transStatusFilter')?.value || 'active';
  if (statusFilter === 'active') {
    transactions = transactions.filter(t => !t.returnDate);
  } else if (statusFilter === 'Overdue') {
    transactions = transactions.filter(t => t.status === 'Overdue' && !t.returnDate);
  } else if (statusFilter === 'Returned') {
    transactions = transactions.filter(t => t.returnDate);
  }

  // 3. Render HTML
  tableBody.innerHTML = '';

  if (transactions.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="${role === 'Admin' ? 5 : 4}" style="text-align: center; color: var(--text-muted); padding: 3rem 1.5rem;">
          <i data-lucide="clipboard-x" style="width: 42px; height: 42px; margin: 0 auto 0.75rem; color: var(--text-muted);"></i>
          <div style="font-weight: 600;">No transactions matching filter</div>
        </td>
      </tr>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  // Sort logs by newest issueDate first
  transactions.sort((a,b) => new Date(b.issueDate) - new Date(a.issueDate));

  transactions.forEach(t => {
    const tr = document.createElement('tr');
    
    // Status Badge
    let badgeClass = 'badge-primary';
    if (t.status === 'Returned') badgeClass = 'badge-success';
    if (t.status === 'Overdue') badgeClass = 'badge-danger';
    const statusBadge = `<span class="badge ${badgeClass}">${t.status}</span>`;

    // Timeline cell
    let timelineHTML = `
      <div><span style="font-size: 0.8rem; color: var(--text-muted);">Issued:</span> ${utils.formatDate(t.issueDate)}</div>
      <div><span style="font-size: 0.8rem; color: var(--text-muted);">Due:</span> ${utils.formatDate(t.dueDate)}</div>
    `;
    if (t.returnDate) {
      timelineHTML += `<div><span style="font-size: 0.8rem; color: var(--text-success);">Returned:</span> ${utils.formatDate(t.returnDate)}</div>`;
    }

    // Actions cell (only shown for Admin role + active rentals)
    let actionsCell = '';
    if (role === 'Admin') {
      if (!t.returnDate) {
        actionsCell = `
          <td>
            <div style="display: flex; gap: 0.35rem;">
              <button class="btn btn-success btn-icon" onclick="returnBook('${t.id}')" title="Process Return">
                <i data-lucide="check"></i>
              </button>
              <button class="btn btn-secondary btn-icon" onclick="renewBook('${t.id}')" title="Extend 7 Days">
                <i data-lucide="calendar-days"></i>
              </button>
            </div>
          </td>
        `;
      } else {
        // Returned transactions have no actions
        actionsCell = `<td><span style="font-size: 0.85rem; color: var(--text-muted); font-style: italic;">Finalised</span></td>`;
      }
    }

    tr.innerHTML = `
      <td style="font-weight: 600;">
        ${t.memberName}
        <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 400;">ID: ${t.memberId}</div>
      </td>
      <td>
        <div style="font-weight: 700; color: var(--text-primary);">${t.bookTitle}</div>
        <div style="font-size: 0.75rem; color: var(--text-muted);">TXID: ${t.id}</div>
      </td>
      <td>${timelineHTML}</td>
      <td>${statusBadge}</td>
      ${actionsCell}
    `;

    tableBody.appendChild(tr);
  });

  // Re-hide action headers if Member role is selected
  const actionHeader = document.querySelector('th.admin-only');
  if (actionHeader) {
    actionHeader.style.display = role === 'Admin' ? '' : 'none';
  }

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Issue Book Process Submission
function handleIssueSubmit(e) {
  e.preventDefault();

  const memberId = document.getElementById('selectedMemberId').value;
  const bookId = document.getElementById('selectedBookId').value;
  const dueDate = document.getElementById('issueDueDate').value;

  const memberNameRaw = document.getElementById('issueMemberInput').value.trim();
  const bookTitleRaw = document.getElementById('issueBookInput').value.trim();

  // Validate selects
  const books = getBooks();
  const members = getMembers();

  let finalMember = members.find(m => m.id === memberId);
  let finalBook = books.find(b => b.id === bookId);

  // Fallback: If no ID was set via click but name exists, try to match it
  if (!finalMember) {
    finalMember = members.find(m => m.name.toLowerCase() === memberNameRaw.toLowerCase());
  }
  if (!finalBook) {
    finalBook = books.find(b => b.title.toLowerCase() === bookTitleRaw.toLowerCase());
  }

  if (!finalMember) {
    showToast('Invalid Reader selected. Choose a registered member from the list.', 'error');
    return;
  }

  if (!finalBook) {
    showToast('Invalid Book selected. Select an available book from stock.', 'error');
    return;
  }

  if (finalBook.available <= 0) {
    showToast(`"${finalBook.title}" is currently out of stock!`, 'error');
    return;
  }

  // Record borrowing
  const transactions = getTransactions();
  const today = new Date().toISOString().split('T')[0];

  const newTx = {
    id: 't_' + Math.random().toString(36).substr(2, 9),
    bookId: finalBook.id,
    bookTitle: finalBook.title,
    memberId: finalMember.id,
    memberName: finalMember.name,
    issueDate: today,
    dueDate: dueDate,
    returnDate: null,
    status: dueDate < today ? 'Overdue' : 'Issued'
  };

  // Decrement availability
  const bookIndex = books.findIndex(b => b.id === finalBook.id);
  books[bookIndex].available -= 1;

  // Save changes
  transactions.push(newTx);
  saveBooks(books);
  saveTransactions(transactions);

  // Reset form
  document.getElementById('issueMemberInput').value = '';
  document.getElementById('selectedMemberId').value = '';
  document.getElementById('issueBookInput').value = '';
  document.getElementById('selectedBookId').value = '';

  showToast(`Book successfully issued to ${finalMember.name}!`, 'success');
  
  renderTransactions();
}

// Return Book Handler
function returnBook(transId) {
  const transactions = getTransactions();
  const txIndex = transactions.findIndex(t => t.id === transId);
  if (txIndex === -1) return;

  const tx = transactions[txIndex];
  const books = getBooks();
  const bookIndex = books.findIndex(b => b.id === tx.bookId);

  if (bookIndex !== -1) {
    // Increase stock copies
    books[bookIndex].available = Math.min(books[bookIndex].copies, books[bookIndex].available + 1);
    saveBooks(books);
  }

  // Update transaction status
  const today = new Date().toISOString().split('T')[0];
  transactions[txIndex].returnDate = today;
  transactions[txIndex].status = 'Returned';
  
  saveTransactions(transactions);
  showToast(`"${tx.bookTitle}" returned safely. Stock restored.`, 'success');
  renderTransactions();
}

// Renew Book Handler (Extend due date by 7 days)
function renewBook(transId) {
  const transactions = getTransactions();
  const txIndex = transactions.findIndex(t => t.id === transId);
  if (txIndex === -1) return;

  const tx = transactions[txIndex];
  
  const currentDue = new Date(tx.dueDate);
  currentDue.setDate(currentDue.getDate() + 7);
  const newDueDate = currentDue.toISOString().split('T')[0];

  transactions[txIndex].dueDate = newDueDate;

  // Update status based on new date relative to today
  const today = new Date().toISOString().split('T')[0];
  if (newDueDate >= today) {
    transactions[txIndex].status = 'Issued';
  } else {
    transactions[txIndex].status = 'Overdue';
  }

  saveTransactions(transactions);
  showToast(`Renewal processed. Extended to ${utils.formatDate(newDueDate)}.`, 'success');
  renderTransactions();
}
