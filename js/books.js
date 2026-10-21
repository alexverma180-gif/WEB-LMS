/**
 * books.js - Books Catalogue Controller
 * Library Management System (LMS)
 */

const DEFAULT_COVER_IMAGES = {
  Computers: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&w=400&q=80',
  Science: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=400&q=80',
  Fiction: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=400&q=80',
  History: 'https://images.unsplash.com/photo-1447069387593-a5de0862481e?auto=format&fit=crop&w=400&q=80',
  Psychology: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=400&q=80',
  Biography: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=400&q=80',
  Business: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80'
};

const GENERIC_COVER = 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=400&q=80';

document.addEventListener('DOMContentLoaded', () => {
  // Check Query String for quick actions (e.g. opened from dashboard shortcuts)
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('action') === 'new' && getRole() === 'Admin') {
    openBookFormModal();
  }

  // Bind Listeners
  const searchInput = document.getElementById('bookSearchInput');
  const catFilter = document.getElementById('categoryFilter');
  const availFilter = document.getElementById('availabilityFilter');
  
  if (searchInput) searchInput.addEventListener('input', renderBooks);
  if (catFilter) catFilter.addEventListener('change', renderBooks);
  if (availFilter) availFilter.addEventListener('change', renderBooks);

  // Modal actions
  const addBtn = document.getElementById('addBookBtn');
  const closeBtn = document.getElementById('closeBookModal');
  const cancelBtn = document.getElementById('cancelBookBtn');
  const bookForm = document.getElementById('bookForm');

  if (addBtn) addBtn.addEventListener('click', () => openBookFormModal());
  if (closeBtn) closeBtn.addEventListener('click', closeBookFormModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeBookFormModal);
  if (bookForm) bookForm.addEventListener('submit', handleBookFormSubmit);

  // Initial Render
  renderBooks();

  // Listen to Role changes
  window.addEventListener('roleChanged', () => {
    renderBooks();
  });
});

// Render Catalogue Cards
function renderBooks() {
  const container = document.getElementById('booksGridContainer');
  if (!container) return;

  const role = getRole();
  const books = getBooks();

  // Filters
  const query = document.getElementById('bookSearchInput')?.value.toLowerCase().trim() || '';
  const category = document.getElementById('categoryFilter')?.value || 'all';
  const availability = document.getElementById('availabilityFilter')?.value || 'all';

  // Perform Filtering
  const filteredBooks = books.filter(b => {
    // Search Query Match
    const matchesSearch = b.title.toLowerCase().includes(query) || 
                          b.author.toLowerCase().includes(query) || 
                          b.isbn.includes(query);
    
    // Category Match
    const matchesCategory = category === 'all' || b.category === category;

    // Availability Match
    let matchesAvail = true;
    if (availability === 'available') {
      matchesAvail = b.available > 0;
    } else if (availability === 'outofstock') {
      matchesAvail = b.available === 0;
    }

    return matchesSearch && matchesCategory && matchesAvail;
  });

  // Render HTML
  container.innerHTML = '';
  
  if (filteredBooks.length === 0) {
    container.style.display = 'block';
    container.innerHTML = `
      <div class="card" style="text-align: center; padding: 4rem 2rem; color: var(--text-secondary); width: 100%;">
        <i data-lucide="book-x" style="width: 48px; height: 48px; margin: 0 auto 1rem; color: var(--text-muted);"></i>
        <h3>No books found matching criteria</h3>
        <p style="margin-top: 0.5rem; font-size: 0.9rem;">Try relaxing your search terms or filters.</p>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  // Restore CSS grid display
  container.style.display = 'grid';

  filteredBooks.forEach(b => {
    const card = document.createElement('div');
    card.className = 'card book-card';
    
    const isAvailable = b.available > 0;
    const statusBadge = isAvailable 
      ? `<span class="badge badge-success book-card-badge">Available</span>`
      : `<span class="badge badge-danger book-card-badge">Out of Stock</span>`;
      
    const coverUrl = b.coverImageUrl || DEFAULT_COVER_IMAGES[b.category] || GENERIC_COVER;

    // Action buttons based on Role
    let actionButtons = '';
    if (role === 'Admin') {
      actionButtons = `
        <button class="btn btn-secondary btn-icon" onclick="editBook('${b.id}')" title="Edit Book">
          <i data-lucide="edit-3"></i>
        </button>
        <button class="btn btn-danger btn-icon" onclick="deleteBook('${b.id}')" title="Delete Book">
          <i data-lucide="trash-2"></i>
        </button>
      `;
    } else {
      actionButtons = `
        <button class="btn btn-primary" onclick="requestBorrow('${b.id}')" ${!isAvailable ? 'disabled' : ''}>
          <i data-lucide="hand-metal"></i> <span>Borrow Book</span>
        </button>
      `;
    }

    card.innerHTML = `
      <div class="book-card-image">
        <img src="${coverUrl}" alt="${b.title}" onerror="this.src='${GENERIC_COVER}'">
        ${statusBadge}
      </div>
      <div class="book-card-content">
        <span class="book-card-category">${b.category}</span>
        <h4 class="book-card-title">${b.title}</h4>
        <span class="book-card-author">by ${b.author}</span>
        
        <div class="book-card-details">
          <span><i data-lucide="hash" style="width: 14px; height: 14px;"></i> ${b.isbn}</span>
          <span><i data-lucide="bookmark" style="width: 14px; height: 14px;"></i> ${b.available}/${b.copies} copies</span>
        </div>
        <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.5rem; display: flex; align-items: center; gap: 0.25rem;">
          <i data-lucide="navigation" style="width: 14px; height: 14px;"></i> <span>Loc: ${b.location}</span>
        </div>
      </div>
      <div class="book-card-actions">
        ${actionButtons}
      </div>
    `;

    container.appendChild(card);
  });

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Modal Toggle Control
function openBookFormModal(book = null) {
  const overlay = document.getElementById('bookModalOverlay');
  const title = document.getElementById('bookModalTitle');
  const form = document.getElementById('bookForm');

  if (!overlay) return;

  form.reset();

  if (book) {
    title.textContent = 'Edit Book';
    document.getElementById('bookFormId').value = book.id;
    document.getElementById('bookTitleInput').value = book.title;
    document.getElementById('bookAuthorInput').value = book.author;
    document.getElementById('bookIsbnInput').value = book.isbn;
    document.getElementById('bookCategoryInput').value = book.category;
    document.getElementById('bookYearInput').value = book.publishedYear;
    document.getElementById('bookCopiesInput').value = book.copies;
    document.getElementById('bookLocationInput').value = book.location;
    document.getElementById('bookImageInput').value = book.coverImageUrl || '';
  } else {
    title.textContent = 'Add New Book';
    document.getElementById('bookFormId').value = '';
  }

  overlay.classList.add('active');
}

function closeBookFormModal() {
  const overlay = document.getElementById('bookModalOverlay');
  if (overlay) overlay.classList.remove('active');
}

// Handle Form Submission
function handleBookFormSubmit(e) {
  e.preventDefault();

  const id = document.getElementById('bookFormId').value;
  const title = document.getElementById('bookTitleInput').value.trim();
  const author = document.getElementById('bookAuthorInput').value.trim();
  const isbn = document.getElementById('bookIsbnInput').value.trim();
  const category = document.getElementById('bookCategoryInput').value;
  const publishedYear = parseInt(document.getElementById('bookYearInput').value);
  const copies = parseInt(document.getElementById('bookCopiesInput').value);
  const location = document.getElementById('bookLocationInput').value.trim();
  const coverImageUrl = document.getElementById('bookImageInput').value.trim();

  const books = getBooks();

  if (id) {
    // Editing Mode
    const index = books.findIndex(b => b.id === id);
    if (index !== -1) {
      const oldBook = books[index];
      
      // Calculate new available based on copies changes
      const diffCopies = copies - oldBook.copies;
      let newAvailable = oldBook.available + diffCopies;
      
      if (newAvailable < 0) {
        showToast('Cannot set total copies lower than active rentals.', 'error');
        return;
      }

      books[index] = {
        ...oldBook,
        title,
        author,
        isbn,
        category,
        publishedYear,
        copies,
        available: newAvailable,
        location,
        coverImageUrl
      };
      
      saveBooks(books);
      showToast('Book details updated successfully!', 'success');
    }
  } else {
    // Creation Mode
    // Check if ISBN exists
    if (books.some(b => b.isbn === isbn)) {
      showToast('A book with this ISBN already exists!', 'error');
      return;
    }

    const newBook = {
      id: utils.uuid(),
      title,
      author,
      isbn,
      category,
      publishedYear,
      copies,
      available: copies, // all copies initially available
      location,
      coverImageUrl
    };

    books.push(newBook);
    saveBooks(books);
    showToast('New book added to library inventory!', 'success');
  }

  closeBookFormModal();
  renderBooks();
}

// Edit book click handler
function editBook(id) {
  const books = getBooks();
  const book = books.find(b => b.id === id);
  if (book) {
    openBookFormModal(book);
  }
}

// Delete book click handler
function deleteBook(id) {
  const books = getBooks();
  const book = books.find(b => b.id === id);
  if (!book) return;

  // Check if book has active transactions
  const transactions = getTransactions();
  const hasActiveRental = transactions.some(t => t.bookId === id && !t.returnDate);

  if (hasActiveRental) {
    showToast(`Cannot delete "${book.title}". It is currently issued to a member!`, 'error');
    return;
  }

  if (confirm(`Are you sure you want to permanently delete "${book.title}" from the library?`)) {
    const updatedBooks = books.filter(b => b.id !== id);
    saveBooks(updatedBooks);
    showToast('Book removed from library catalogue.', 'success');
    renderBooks();
  }
}

// Member borrow request handler
function requestBorrow(id) {
  const books = getBooks();
  const bookIndex = books.findIndex(b => b.id === id);
  if (bookIndex === -1) return;

  const book = books[bookIndex];
  if (book.available <= 0) {
    showToast('This book is currently out of stock!', 'error');
    return;
  }

  // Issue to current default Member (Sarah Miller - id: m2)
  const defaultMember = SEED_MEMBERS[1]; // Sarah Miller
  
  // Create transaction
  const transactions = getTransactions();
  
  // Calculate dates
  const today = new Date().toISOString().split('T')[0];
  const due = getRelativeDateString(14); // 2 weeks from now
  
  const newTransaction = {
    id: 't_' + Math.random().toString(36).substr(2, 9),
    bookId: book.id,
    bookTitle: book.title,
    memberId: defaultMember.id,
    memberName: defaultMember.name,
    issueDate: today,
    dueDate: due,
    returnDate: null,
    status: 'Issued'
  };

  // Adjust book availability
  books[bookIndex].available -= 1;
  
  // Push changes
  transactions.push(newTransaction);
  
  saveBooks(books);
  saveTransactions(transactions);
  
  showToast(`Successfully borrowed "${book.title}"! Due date: ${utils.formatDate(due)}`, 'success');
  
  renderBooks();
}
