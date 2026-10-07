import './styles.css';
import { Book, formatBook, Catalog} from './task1-types';
import { addBook, removeBook, getBook} from './task2-functions';
import { applyFilters, filterByAuthor, filterByMinYear } from './task3-filters';
import { createBookFromForm } from "./task4-integration";
import { filterByTitle, sortBooks } from './task5-utils';

// ============================================================
// ИСХОДНОЕ СОСТОЯНИЕ
// ============================================================
let catalog: Catalog = {
  '1': { id: '1', title: 'TypeScript Guide', authors: ['John Doe'], year: 2024 },
  '2': { id: '2', title: 'JavaScript Basics', authors: ['Jane Smith'], year: 2022 },
};

// ============================================================
// СОХРАНЕНИЕ В localStorage (Задание 1)
// ============================================================
const saved = localStorage.getItem('catalog');
if (saved) {
  catalog = JSON.parse(saved);
}
function saveCatalog(): void {
  localStorage.setItem('catalog', JSON.stringify(catalog));
}
// ============================================================
// DOM-элементы
// ============================================================
const bookList = document.querySelector('#bookList') as HTMLDivElement;
const form = document.querySelector('#bookForm') as HTMLFormElement;
const filterBtn = document.querySelector('#applyFilters') as HTMLButtonElement;
const authorInput = document.querySelector('#filterAuthor') as HTMLInputElement;
const yearInput = document.querySelector('#filterYear') as HTMLInputElement;
const errorMessage = document.querySelector('#errorMessage') as HTMLDivElement;

// Задание 2: новые элементы
const searchInput = document.querySelector('#searchInput') as HTMLInputElement;
const sortBySelect = document.querySelector('#sortBy') as HTMLSelectElement;


function renderBooks(books: Book[]) {
  bookList.innerHTML = '';

  if (books.length === 0) {
    bookList.textContent = 'Книги не найдены. Попробуйте изменить фильтры.';
    return;
  }

  books.forEach(book => {
    const card = document.createElement('div');
    card.className = 'book-card';

    const titleEl = document.createElement('h3');
    titleEl.textContent = formatBook(book);

    const authorsEl = document.createElement('p');
    authorsEl.textContent = `Авторы: ${book.authors.join(', ')}`;

    card.append(titleEl, authorsEl);

    if (book.year !== undefined) {
      const yearEl = document.createElement('p');
      yearEl.textContent = `Год: ${book.year}`;
      card.append(yearEl);
    }
    if (book.rating !== undefined) {
      const ratingEl = document.createElement('p');
      ratingEl.textContent = `Рейтинг: ${book.rating}`;
      card.append(ratingEl);
    }

    // ============================================================
    // ЗАДАНИЕ 0: КНОПКА «УДАЛИТЬ»
    // ============================================================
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Удалить';
    deleteBtn.addEventListener('click', () => {
      catalog = removeBook(catalog, book.id);
      saveCatalog();
      updateList(); // было: renderBooks(Object.values(catalog))
    });
    card.append(deleteBtn);
    bookList.append(card);
  });
}

// ============================================================
// ОБНОВЛЕНИЕ СПИСКА: фильтры + поиск + сортировка (Задание 2)
// ============================================================
// Одна функция собирает все условия со страницы и перерисовывает список.
// Её вызывают: кнопка «Применить», ввод в поиске, смена сортировки,
// а также добавление и удаление книги — чтобы поиск и сортировка
// не «слетали» после этих действий.
function updateList() {
  const filters: ((book: Book) => boolean)[] = [];

  if (authorInput.value.trim()) {
    filters.push(filterByAuthor(authorInput.value.trim()));
  }
  if (yearInput.value) {
    filters.push(filterByMinYear(parseInt(yearInput.value, 10)));
  }
  if (searchInput.value.trim()) {
    filters.push(filterByTitle(searchInput.value.trim()));
  }

  const allBooks = Object.values(catalog);
  const filteredBooks = applyFilters(allBooks, filters);

  renderBooks(sortBooks(filteredBooks, sortBySelect.value as 'year' | 'rating'));
}

// ============================================================
// ПЕРВИЧНАЯ ОТРИСОВКА
// ============================================================
// К этому моменту catalog уже содержит либо начальные данные,
// либо данные из localStorage.
updateList();


// ============================================================
// ОБРАБОТЧИК ФОРМЫ
// ============================================================
form.addEventListener('submit', (e) => {
  e.preventDefault();
  errorMessage.textContent = '';
  try{
    const formData = new FormData(form);
    const newBook = createBookFromForm(formData);
    catalog = addBook(catalog, newBook);

    saveCatalog();

    form.reset();
    updateList(); // было: renderBooks(Object.values(catalog))
  } catch(error){
    if(error instanceof Error){
      errorMessage.textContent = error.message;
    }
  }
});


// ============================================================
// ОБРАБОТЧИКИ ФИЛЬТРОВ, ПОИСКА И СОРТИРОВКИ
// ============================================================
filterBtn.addEventListener('click', updateList);
searchInput.addEventListener('input', updateList);    // при каждом символе в поиске
sortBySelect.addEventListener('change', updateList);  // при смене сортировки