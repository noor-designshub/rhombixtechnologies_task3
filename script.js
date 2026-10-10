// Dynamic Dataset
let books = [
  {
    id: 1,
    title: "The Psychology of Money",
    author: "Morgan Housel",
    category: "Business",
    status: "Available",
    cover: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 2,
    title: "Atomic Habits",
    author: "James Clear",
    category: "Self Development",
    status: "Borrowed",
    borrower: "Ali Khan",
    cover: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 3,
    title: "Clean Code",
    author: "Robert C. Martin",
    category: "Technology",
    status: "Available",
    cover: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 4,
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    category: "Fiction",
    status: "Available",
    cover: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 5,
    title: "Deep Work",
    author: "Cal Newport",
    category: "Self Development",
    status: "Borrowed",
    borrower: "Sara Ahmed",
    cover: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 6,
    title: "The Lean Startup",
    author: "Eric Ries",
    category: "Business",
    status: "Available",
    cover: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop"
  }
];

let borrowHistory = [];

const categoryIcons = {
  "Fiction": "fa-book-open",
  "Technology": "fa-code",
  "Business": "fa-briefcase",
  "Self Development": "fa-seedling",
  "Education": "fa-graduation-cap",
  "Other": "fa-bookmark"
};

// DOM Elements
const booksGrid = document.getElementById('booksGrid');
const categoriesGrid = document.getElementById('categoriesGrid');
const historyTableBody = document.getElementById('historyTableBody');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const statusFilter = document.getElementById('statusFilter');

const modalOverlay = document.getElementById('modalOverlay');
const openModalBtn = document.getElementById('openModalBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const modalCloseIcon = document.getElementById('modalCloseIcon');
const addBookForm = document.getElementById('addBookForm');

// Mobile Sidebar Controls
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const openSidebarBtn = document.getElementById('openSidebarBtn');
const closeSidebarBtn = document.getElementById('closeSidebarBtn');

function toggleSidebar() {
  sidebar.classList.toggle('active');
  sidebarOverlay.classList.toggle('active');
}

openSidebarBtn.addEventListener('click', toggleSidebar);
closeSidebarBtn.addEventListener('click', toggleSidebar);
sidebarOverlay.addEventListener('click', toggleSidebar);

// Dynamic Stats Updates
function updateStats() {
  document.getElementById('statTotal').innerText = books.length;
  document.getElementById('statAvailable').innerText = books.filter(b => b.status === "Available").length;
  document.getElementById('statBorrowed').innerText = books.filter(b => b.status === "Borrowed").length;
  document.getElementById('statCategories').innerText = new Set(books.map(b => b.category)).size;
}

// Render Book Cards
function renderBooks() {
  const search = searchInput.value.toLowerCase();
  const cat = categoryFilter.value;
  const stat = statusFilter.value;

  booksGrid.innerHTML = '';

  const filtered = books.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(search) || b.author.toLowerCase().includes(search);
    const matchesCategory = cat === 'All' || b.category === cat;
    const matchesStatus = stat === 'All' || b.status === stat;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (filtered.length === 0) {
    booksGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px;">No matching books found.</p>`;
    return;
  }

  filtered.forEach(book => {
    const card = document.createElement('div');
    card.className = 'book-card';

    const coverHtml = book.cover ? 
      `<img src="${book.cover}" alt="${book.title}" loading="lazy" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'placeholder-cover\\'>Book</div>'">` : 
      `<div class="placeholder-cover">Book</div>`;

    card.innerHTML = `
      <div class="book-cover-wrap">
        ${coverHtml}
        <span class="status-badge ${book.status.toLowerCase()}">${book.status}</span>
      </div>
      <div class="book-details">
        <span class="category-pill">${book.category}</span>
        <h3 class="book-title">${book.title}</h3>
        <p class="book-author">by ${book.author}</p>
        
        <div class="card-actions">
          <button class="btn-card btn-borrow" onclick="toggleBorrow(${book.id})">
            <i class="fa-solid ${book.status === 'Available' ? 'fa-arrow-up-right-from-square' : 'fa-rotate-left'}"></i>
            ${book.status === 'Available' ? 'Borrow' : 'Return'}
          </button>
          <button class="btn-card btn-icon" onclick="editBook(${book.id})"><i class="fa-solid fa-pen"></i></button>
          <button class="btn-card btn-icon btn-delete" onclick="deleteBook(${book.id})"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>
    `;
    booksGrid.appendChild(card);
  });

  updateStats();
  renderCategories();
}

// Render Categories Card Count
function renderCategories() {
  categoriesGrid.innerHTML = '';
  const categoriesList = ["Fiction", "Technology", "Business", "Self Development", "Education", "Other"];

  categoriesList.forEach(cat => {
    const count = books.filter(b => b.category === cat).length;
    const icon = categoryIcons[cat] || 'fa-bookmark';

    const catCard = document.createElement('div');
    catCard.className = 'category-card';
    catCard.innerHTML = `
      <div class="category-icon"><i class="fa-solid ${icon}"></i></div>
      <h4>${cat}</h4>
      <span style="font-size:0.8rem; color: var(--text-muted);">${count} Books</span>
    `;
    categoriesGrid.appendChild(catCard);
  });
}

// Borrow & Return Logic
function toggleBorrow(id) {
  const book = books.find(b => b.id === id);
  const today = new Date().toISOString().split('T')[0];

  if (book.status === 'Available') {
    const borrower = prompt("Enter Borrower Name:");
    if (borrower) {
      book.status = 'Borrowed';
      book.borrower = borrower;
      borrowHistory.unshift({
        book: book.title,
        borrower: borrower,
        borrowDate: today,
        returnDate: 'Pending',
        status: 'Borrowed'
      });
    }
  } else {
    book.status = 'Available';
    const record = borrowHistory.find(h => h.book === book.title && h.status === 'Borrowed');
    if (record) {
      record.returnDate = today;
      record.status = 'Returned';
    }
    delete book.borrower;
  }

  renderBooks();
  renderHistory();
}

function deleteBook(id) {
  if (confirm("Are you sure you want to delete this book?")) {
    books = books.filter(b => b.id !== id);
    renderBooks();
  }
}

function editBook(id) {
  const book = books.find(b => b.id === id);
  const newTitle = prompt("Edit Title:", book.title);
  if (newTitle) {
    book.title = newTitle;
    renderBooks();
  }
}

function renderHistory() {
  historyTableBody.innerHTML = '';

  if (borrowHistory.length === 0) {
    historyTableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 20px;">No borrow history recorded yet.</td></tr>`;
    return;
  }

  borrowHistory.forEach(item => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><b>${item.book}</b></td>
      <td>${item.borrower}</td>
      <td>${item.borrowDate}</td>
      <td>${item.returnDate}</td>
      <td><span class="status-badge ${item.status.toLowerCase()}">${item.status}</span></td>
    `;
    historyTableBody.appendChild(row);
  });
}

// Modal Handlers
const openModal = () => modalOverlay.classList.add('active');
const closeModal = () => modalOverlay.classList.remove('active');

openModalBtn.addEventListener('click', openModal);
closeModalBtn.addEventListener('click', closeModal);
modalCloseIcon.addEventListener('click', closeModal);

addBookForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const coverInput = document.getElementById('bookCover').value;
  
  const newBook = {
    id: Date.now(),
    title: document.getElementById('bookTitle').value,
    author: document.getElementById('bookAuthor').value,
    cover: coverInput ? coverInput : "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop",
    category: document.getElementById('bookCategory').value,
    status: 'Available'
  };

  books.unshift(newBook);
  renderBooks();
  closeModal();
  addBookForm.reset();
});

// Event Listeners
searchInput.addEventListener('input', renderBooks);
categoryFilter.addEventListener('change', renderBooks);
statusFilter.addEventListener('change', renderBooks);

// App Execution
renderBooks();
renderHistory();