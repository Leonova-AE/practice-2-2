import './styles.css';
import { Book, formatBook, Catalog} from './task1-types';
import { addBook, removeBook, getBook} from './task2-functions';
import { applyFilters, filterByAuthor, filterByMinYear } from './task3-filters';
import { createBookFromForm } from "./task4-integration";

// ============================================================
// ИСХОДНОЕ СОСТОЯНИЕ
// ============================================================
// TODO (Задание 1): ПЕРЕД этим присваиванием проверьте localStorage:
//   const saved = localStorage.getItem('catalog');
//   if (saved) { ... JSON.parse(saved) ... }
// Если данные в хранилище есть — используйте их вместо начальных.
let catalog: Catalog = {
  '1': { id: '1', title: 'TypeScript Guide', authors: ['John Doe'], year: 2024 },
  '2': { id: '2', title: 'JavaScript Basics', authors: ['Jane Smith'], year: 2022 },
};

// ============================================================
// СОХРАНЕНИЕ В localStorage (Задание 1)
// ============================================================
// TODO: Создайте функцию saveCatalog(), которая делает:
//   localStorage.setItem('catalog', JSON.stringify(catalog));
// Её будем вызывать в двух местах: после addBook и после removeBook.
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

// TODO (Задание 2): получите новые элементы
// const searchInput = document.querySelector('#searchInput') as HTMLInputElement;
// const sortBySelect = document.querySelector('#sortBy') as HTMLSelectElement;


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
    // TODO: Создайте кнопку deleteBtn («Удалить») через createElement.
    // Повесьте на неё обработчик click:
    //   1. catalog = removeBook(catalog, book.id)
    //   2. renderBooks(Object.values(catalog))
    // Добавьте кнопку в card через card.append(deleteBtn)
    // ВНИМАНИЕ: в index.html эту кнопку добавлять НЕ НУЖНО.
    // Она создаётся динамически для каждой карточки,
    // чтобы знать, какую именно книгу удалять (замыкание на book.id).
  const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Удалить';
    deleteBtn.addEventListener('click', () => {
      catalog = removeBook(catalog, book.id);
      saveCatalog();
      renderBooks(Object.values(catalog));
    });
    card.append(deleteBtn);
    bookList.append(card);
  });
}

// ============================================================
// ПЕРВИЧНАЯ ОТРИСОВКА
// ============================================================
// К этому моменту catalog уже должен содержать либо начальные данные,
// либо данные из localStorage (см. TODO в самом верху файла).
renderBooks(Object.values(catalog));


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
    
    // TODO (Задание 1): ВЫЗОВИТЕ saveCatalog() ЗДЕСЬ
    // (после addBook, но до reset и renderBooks)
    saveCatalog();

    form.reset();
    renderBooks(Object.values(catalog));  
  } catch(error){
    if(error instanceof Error){   
      errorMessage.textContent = error.message; 
    }
  }
});


// ============================================================
// ОБРАБОТЧИК ФИЛЬТРОВ
// ============================================================
filterBtn.addEventListener('click', () => {
  const filters: ((book: Book) => boolean)[] = [];
  
  if (authorInput.value.trim()) {
    filters.push(filterByAuthor(authorInput.value.trim()));
  }
  if (yearInput.value) {
    filters.push(filterByMinYear(parseInt(yearInput.value, 10)));
  }

  const allBooks = Object.values(catalog);
  const filteredBooks = applyFilters(allBooks, filters);
  
  renderBooks(filteredBooks);
});