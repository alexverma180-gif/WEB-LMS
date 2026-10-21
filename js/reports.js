/**
 * reports.js - Analytics & Charts Controller
 * Library Management System (LMS)
 */

let charts = {}; // Track active chart instances to destroy/re-create dynamically

document.addEventListener('DOMContentLoaded', () => {
  // Initial draw
  initAnalytics();

  // Redraw when role switches
  window.addEventListener('roleChanged', () => {
    initAnalytics();
  });

  // Redraw when theme switches to align canvas font colours
  const themeObserver = new MutationObserver(() => {
    initAnalytics();
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
});

function initAnalytics() {
  const role = getRole();

  // Role adjustments
  const overduePanel = document.getElementById('overdueReportPanel');
  const insightsPanel = document.getElementById('memberInsightsPanel');

  if (role === 'Admin') {
    if (overduePanel) overduePanel.style.display = 'flex';
    if (insightsPanel) insightsPanel.style.display = 'none';
    renderOverdueRegister();
  } else {
    if (overduePanel) overduePanel.style.display = 'none';
    if (insightsPanel) insightsPanel.style.display = 'flex';
  }

  // Calculate & set KPI cards
  calculateKPIs();

  // Create/Redraw Charts
  renderCharts();
}

function calculateKPIs() {
  const books = getBooks();
  const transactions = getTransactions();

  // 1. Circulation Rate = (Borrowed Books / Total Copies) * 100
  const totalCopies = books.reduce((sum, b) => sum + b.copies, 0);
  const activeBorrows = transactions.filter(t => !t.returnDate).length;
  const circRate = totalCopies > 0 ? Math.round((activeBorrows / totalCopies) * 100) : 0;
  
  const circEl = document.getElementById('kpiCirculation');
  if (circEl) circEl.textContent = `${circRate}%`;

  // 2. Avg Loan Period in Days
  const returnedTx = transactions.filter(t => t.returnDate);
  let avgDays = 14; // Default if no returned transactions
  if (returnedTx.length > 0) {
    const totalDays = returnedTx.reduce((sum, t) => {
      const issue = new Date(t.issueDate);
      const returned = new Date(t.returnDate);
      const diff = returned - issue;
      return sum + Math.ceil(diff / (1000 * 60 * 60 * 24));
    }, 0);
    avgDays = Math.round(totalDays / returnedTx.length);
  }
  
  const avgEl = document.getElementById('kpiAvgCheckout');
  if (avgEl) avgEl.textContent = `${avgDays} days`;

  // 3. Top Category / Genre
  const categoryCounts = {};
  books.forEach(b => {
    categoryCounts[b.category] = (categoryCounts[b.category] || 0) + 1;
  });
  
  let topCategory = 'None';
  let maxCount = 0;
  Object.keys(categoryCounts).forEach(cat => {
    if (categoryCounts[cat] > maxCount) {
      maxCount = categoryCounts[cat];
      topCategory = cat;
    }
  });

  const popularEl = document.getElementById('kpiMostPopular');
  if (popularEl) popularEl.textContent = topCategory;
}

function renderCharts() {
  // Clean up any existing charts before recreating to avoid redraw hover glitch
  Object.keys(charts).forEach(key => {
    if (charts[key]) {
      charts[key].destroy();
    }
  });

  // Pull theme colours from computed styles
  const style = getComputedStyle(document.documentElement);
  const textPrimary = style.getPropertyValue('--text-primary').trim() || '#0f172a';
  const textSecondary = style.getPropertyValue('--text-secondary').trim() || '#64748b';
  const borderColor = style.getPropertyValue('--border-color').trim() || '#e2e8f0';

  const books = getBooks();
  const transactions = getTransactions();

  // CHART 1: Books by Category (Doughnut)
  const categoryData = {};
  books.forEach(b => {
    categoryData[b.category] = (categoryData[b.category] || 0) + 1;
  });

  const catCanvas = document.getElementById('categoryChart');
  if (catCanvas) {
    charts.category = new Chart(catCanvas, {
      type: 'doughnut',
      data: {
        labels: Object.keys(categoryData),
        datasets: [{
          data: Object.values(categoryData),
          backgroundColor: [
            'hsl(250, 85%, 62%)', // primary
            'hsl(280, 80%, 60%)', // secondary
            'hsl(142, 70%, 45%)', // success
            'hsl(38, 92%, 50%)',  // warning
            'hsl(355, 84%, 55%)',  // danger
            'hsl(190, 80%, 50%)',  // info
            'hsl(320, 80%, 55%)'   // alternative accent
          ],
          borderWidth: 2,
          borderColor: style.getPropertyValue('--bg-secondary').trim() || '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: textSecondary,
              font: { family: 'Outfit', size: 12 }
            }
          }
        }
      }
    });
  }

  // CHART 2: Availability Status (Pie)
  const totalCopies = books.reduce((sum, b) => sum + b.copies, 0);
  const totalAvailable = books.reduce((sum, b) => sum + b.available, 0);
  const totalBorrowed = totalCopies - totalAvailable;

  const availCanvas = document.getElementById('availabilityChart');
  if (availCanvas) {
    charts.availability = new Chart(availCanvas, {
      type: 'pie',
      data: {
        labels: ['Available', 'On Loan'],
        datasets: [{
          data: [totalAvailable, totalBorrowed],
          backgroundColor: ['hsl(142, 70%, 45%)', 'hsl(250, 85%, 62%)'],
          borderWidth: 2,
          borderColor: style.getPropertyValue('--bg-secondary').trim() || '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: textSecondary,
              font: { family: 'Outfit', size: 12 }
            }
          }
        }
      }
    });
  }

  // CHART 3: Top Borrowed Book Frequencies (Bar)
  const frequencyMap = {};
  transactions.forEach(t => {
    frequencyMap[t.bookTitle] = (frequencyMap[t.bookTitle] || 0) + 1;
  });

  const sortedTitles = Object.keys(frequencyMap).sort((a,b) => frequencyMap[b] - frequencyMap[a]).slice(0, 5);
  const freqData = sortedTitles.map(title => frequencyMap[title]);

  const freqCanvas = document.getElementById('frequencyChart');
  if (freqCanvas) {
    charts.frequency = new Chart(freqCanvas, {
      type: 'bar',
      data: {
        labels: sortedTitles.map(t => t.length > 20 ? t.substring(0, 17) + '...' : t),
        datasets: [{
          label: 'Times Borrowed',
          data: freqData,
          backgroundColor: 'rgba(99, 102, 241, 0.85)',
          borderRadius: 8,
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y', // Horizontal bars
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            ticks: {
              color: textSecondary,
              font: { family: 'Outfit' },
              stepSize: 1
            },
            grid: { color: borderColor }
          },
          y: {
            ticks: {
              color: textPrimary,
              font: { family: 'Outfit', weight: 'bold' }
            },
            grid: { display: false }
          }
        }
      }
    });
  }
}

function renderOverdueRegister() {
  const tableBody = document.getElementById('overdueReportTableBody');
  if (!tableBody) return;

  const transactions = getTransactions();
  const overdueTx = transactions.filter(t => t.status === 'Overdue' && !t.returnDate);

  tableBody.innerHTML = '';

  if (overdueTx.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align: center; color: var(--text-muted); padding: 3rem 1.5rem;">
          <i data-lucide="check-circle" style="width: 38px; height: 38px; margin: 0 auto 0.75rem; color: var(--success);"></i>
          <div style="font-weight: 600;">No overdue checkouts!</div>
        </td>
      </tr>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  overdueTx.forEach(t => {
    const tr = document.createElement('tr');
    
    // Days late = diff between today and dueDate
    const daysLate = Math.abs(utils.getDaysRemaining(t.dueDate));

    tr.innerHTML = `
      <td style="font-weight: 600;">${t.memberName}</td>
      <td>
        <div style="font-weight: 600; font-size: 0.9rem;">${t.bookTitle}</div>
        <div style="font-size: 0.75rem; color: var(--text-muted);">Due: ${utils.formatDate(t.dueDate)}</div>
      </td>
      <td class="text-danger" style="font-weight: 700;">${daysLate} days</td>
      <td>
        <button class="btn btn-secondary btn-icon" onclick="sendMockNotice('${t.id}', '${t.memberName}')" title="Send Alert Email" style="padding:0; width:32px; height:32px; border-radius:var(--radius-sm);">
          <i data-lucide="bell" style="width:14px; height:14px;"></i>
        </button>
      </td>
    `;
    
    tableBody.appendChild(tr);
  });

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Action to Send Mock notification alert
function sendMockNotice(txId, name) {
  showToast(`Overdue borrow notification successfully sent to ${name}!`, 'success');
}
