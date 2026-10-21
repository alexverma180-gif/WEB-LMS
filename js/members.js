/**
 * members.js - Member Management Controller
 * Library Management System (LMS)
 */

const DEFAULT_AVATARS = {
  Admin: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
  Member: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80'
};

document.addEventListener('DOMContentLoaded', () => {
  // Access Security Check
  if (getRole() !== 'Admin') {
    // Redirection is handled in core.js, but let's prevent execution here as well.
    return;
  }

  // Check URL arguments for quick actions
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('action') === 'new') {
    openMemberFormModal();
  }

  // Bind Filter Listeners
  const searchInput = document.getElementById('memberSearchInput');
  const roleFilter = document.getElementById('roleFilter');

  if (searchInput) searchInput.addEventListener('input', renderMembers);
  if (roleFilter) roleFilter.addEventListener('change', renderMembers);

  // Modal actions
  const addBtn = document.getElementById('addMemberBtn');
  const closeBtn = document.getElementById('closeMemberModal');
  const cancelBtn = document.getElementById('cancelMemberBtn');
  const memberForm = document.getElementById('memberForm');

  if (addBtn) addBtn.addEventListener('click', () => openMemberFormModal());
  if (closeBtn) closeBtn.addEventListener('click', closeMemberFormModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeMemberFormModal);
  if (memberForm) memberForm.addEventListener('submit', handleMemberFormSubmit);

  // Initial render
  renderMembers();

  // Listen to Role updates (e.g. if Admin switches to Member on this page, core.js handles redirection)
  window.addEventListener('roleChanged', () => {
    if (getRole() !== 'Admin') {
      // Let core.js handle
      return;
    }
    renderMembers();
  });
});

// Render Member Grid
function renderMembers() {
  const container = document.getElementById('membersGridContainer');
  if (!container) return;

  const members = getMembers();
  const transactions = getTransactions();

  // Inputs
  const query = document.getElementById('memberSearchInput')?.value.toLowerCase().trim() || '';
  const role = document.getElementById('roleFilter')?.value || 'all';

  // Perform filtering
  const filteredMembers = members.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(query) || 
                          m.email.toLowerCase().includes(query) || 
                          m.phone.includes(query);
    const matchesRole = role === 'all' || m.role === role;
    return matchesSearch && matchesRole;
  });

  container.innerHTML = '';

  if (filteredMembers.length === 0) {
    container.style.display = 'block';
    container.innerHTML = `
      <div class="card" style="text-align: center; padding: 4rem 2rem; color: var(--text-secondary); width: 100%;">
        <i data-lucide="user-x" style="width: 48px; height: 48px; margin: 0 auto 1rem; color: var(--text-muted);"></i>
        <h3>No members found matching criteria</h3>
        <p style="margin-top: 0.5rem; font-size: 0.9rem;">Try relaxing your search terms or filters.</p>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  // Restore CSS grid display
  container.style.display = 'grid';

  filteredMembers.forEach(m => {
    // Calculate active rentals count
    const activeBorrows = transactions.filter(t => t.memberId === m.id && !t.returnDate).length;
    
    // Choose correct avatar URL
    const avatarUrl = m.avatarUrl || DEFAULT_AVATARS[m.role];
    
    // Role badge styling
    const badgeClass = m.role === 'Admin' ? 'badge-primary' : 'badge-success';

    const card = document.createElement('div');
    card.className = 'card member-card';
    card.innerHTML = `
      <img src="${avatarUrl}" alt="${m.name}" class="member-card-avatar" onerror="this.src='${DEFAULT_AVATARS[m.role]}'">
      <div class="member-card-details">
        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
          <h4 class="member-card-name">${m.name}</h4>
          <span class="badge ${badgeClass}">${m.role}</span>
        </div>
        <span class="member-card-contact"><i data-lucide="mail" style="width: 12px; height: 12px; display: inline; vertical-align: middle;"></i> ${m.email}</span>
        <span class="member-card-contact"><i data-lucide="phone" style="width: 12px; height: 12px; display: inline; vertical-align: middle;"></i> ${m.phone}</span>
        
        <div class="member-card-meta" style="margin-top: 0.5rem;">
          <span>Joined: ${utils.formatDate(m.joinedDate)}</span>
          <span style="font-weight: 600; color: ${activeBorrows > 0 ? 'var(--primary)' : 'var(--text-muted)'};">
            <i data-lucide="book-marked" style="width: 14px; height: 14px; display: inline; vertical-align: middle; margin-right: 2px;"></i>${activeBorrows} Borrowed
          </span>
        </div>
      </div>
      <div class="member-card-actions">
        <button class="btn btn-secondary btn-icon" onclick="editMember('${m.id}')" title="Edit Member">
          <i data-lucide="edit-3"></i>
        </button>
        <button class="btn btn-danger btn-icon" onclick="deleteMember('${m.id}')" title="Delete Member">
          <i data-lucide="trash-2"></i>
        </button>
      </div>
    `;
    
    container.appendChild(card);
  });

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Modal control
function openMemberFormModal(member = null) {
  const overlay = document.getElementById('memberModalOverlay');
  const title = document.getElementById('memberModalTitle');
  const form = document.getElementById('memberForm');

  if (!overlay) return;

  form.reset();

  if (member) {
    title.textContent = 'Edit Member';
    document.getElementById('memberFormId').value = member.id;
    document.getElementById('memberNameInput').value = member.name;
    document.getElementById('memberEmailInput').value = member.email;
    document.getElementById('memberPhoneInput').value = member.phone;
    document.getElementById('memberRoleInput').value = member.role;
    document.getElementById('memberAvatarInput').value = member.avatarUrl || '';
  } else {
    title.textContent = 'Add New Member';
    document.getElementById('memberFormId').value = '';
  }

  overlay.classList.add('active');
}

function closeMemberFormModal() {
  const overlay = document.getElementById('memberModalOverlay');
  if (overlay) overlay.classList.remove('active');
}

// Submit Form Action
function handleMemberFormSubmit(e) {
  e.preventDefault();

  const id = document.getElementById('memberFormId').value;
  const name = document.getElementById('memberNameInput').value.trim();
  const email = document.getElementById('memberEmailInput').value.trim();
  const phone = document.getElementById('memberPhoneInput').value.trim();
  const role = document.getElementById('memberRoleInput').value;
  const avatarUrl = document.getElementById('memberAvatarInput').value.trim();

  const members = getMembers();

  if (id) {
    // Edit
    const index = members.findIndex(m => m.id === id);
    if (index !== -1) {
      // Prevent editing current admin role to member if it's the main account, but let's allow general edits.
      members[index] = {
        ...members[index],
        name,
        email,
        phone,
        role,
        avatarUrl
      };
      
      saveMembers(members);
      showToast('Member profile updated successfully!', 'success');
      
      // If we edited ourselves (the active user in local storage), let's refresh the role badges globally.
      const currentRole = getRole();
      if (id === 'm1' && currentRole === 'Admin') {
        applyRoleUI('Admin');
      } else if (id === 'm2' && currentRole === 'Member') {
        applyRoleUI('Member');
      }
    }
  } else {
    // Add New
    // Check if email already registered
    if (members.some(m => m.email.toLowerCase() === email.toLowerCase())) {
      showToast('A member with this email is already registered!', 'error');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const newMember = {
      id: utils.uuid(),
      name,
      email,
      phone,
      role,
      joinedDate: today,
      avatarUrl
    };

    members.push(newMember);
    saveMembers(members);
    showToast('New member registered successfully!', 'success');
  }

  closeMemberFormModal();
  renderMembers();
}

// Edit Member Click handler
function editMember(id) {
  const members = getMembers();
  const member = members.find(m => m.id === id);
  if (member) {
    openMemberFormModal(member);
  }
}

// Delete Member Click handler
function deleteMember(id) {
  const members = getMembers();
  const member = members.find(m => m.id === id);
  if (!member) return;

  // Verify active borrows
  const transactions = getTransactions();
  const activeBorrows = transactions.some(t => t.memberId === id && !t.returnDate);

  if (activeBorrows) {
    showToast(`Cannot delete ${member.name}. They have outstanding library checkouts!`, 'error');
    return;
  }

  // Prevent deleting the main admin account to avoid database breaking
  if (id === 'm1') {
    showToast('Cannot delete the primary Admin account.', 'error');
    return;
  }

  if (confirm(`Are you sure you want to remove member "${member.name}"? This action cannot be undone.`)) {
    const updatedMembers = members.filter(m => m.id !== id);
    saveMembers(updatedMembers);
    showToast('Member removed from database.', 'success');
    renderMembers();
  }
}
