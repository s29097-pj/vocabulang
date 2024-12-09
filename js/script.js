let words = [];
let currentWordIndex = 0;
let mistakesTyped = []; // Błędy związane z wpisywaniem
let mistakesSelected = []; // Błędy związane z wyborem
let correctAnswers = 0; // Zmienna do liczenia poprawnych odpowiedzi
let incorrectAnswers = 0; // Zmienna do liczenia złych odpowiedzi

// Funkcja do ładowania słówek z wybranego pliku
async function loadWords() {
    const wordSet = document.getElementById("word-set").value; // Pobierz wybrany zestaw słówek

    try {
        const response = await fetch(`js/${wordSet}`);
        if (!response.ok) {
            throw new Error('Błąd podczas ładowania pliku JSON.');
        }
        words = await response.json(); // Przypisanie danych do zmiennej words
        currentWordIndex = 0; // Zresetowanie indeksu
        mistakesTyped = loadMistakes('typed'); // Załaduj błędne odpowiedzi związane z wpisywaniem z localStorage
        mistakesSelected = loadMistakes('selected'); // Załaduj błędne odpowiedzi związane z wyborem z localStorage
        correctAnswers = 0; // Zresetowanie licznika poprawnych odpowiedzi
        incorrectAnswers = 0; // Zresetowanie licznika złych odpowiedzi
        updateScore(); // Aktualizacja wyświetlanych wyników
        nextWord(); // Przejście do pierwszego słówka
    } catch (error) {
        console.error('Error loading words:', error);
    }
}

// Funkcja wywoływana przy zmianie zestawu w select
document.getElementById("word-set").addEventListener("change", () => {
    loadWords(); // Przeładuj słówka po zmianie zestawu
});

// Inicjalizacja quizu
function nextWord() {
    if (currentWordIndex < words.length && words.length > 0) {
        // Upewnienie się, że element 'polish' istnieje
        document.getElementById("polish-word").innerText = words[currentWordIndex].polish || '';
        document.getElementById("synonym-answer").value = '';
        document.getElementById("feedback").innerText = '';
        document.getElementById("hint").style.display = "none";
        document.getElementById("options").style.display = "none";
    } else {
        endQuiz();
    }
}

// Funkcja sprawdzająca odpowiedź wpisaną przez użytkownika
function checkAnswer() {
    const userAnswer = document.getElementById("synonym-answer").value.toLowerCase();
    const correctAnswersList = words[currentWordIndex].synonyms.map(s => s.toLowerCase());

    if (correctAnswersList.includes(userAnswer)) {
        document.getElementById("feedback").innerText = "Dobrze!";
        correctAnswers++; // Zwiększ licznik poprawnych odpowiedzi
        updateScore(); // Aktualizacja wyników
        currentWordIndex++;
        nextWord();
        clearMistake('typed', words[currentWordIndex - 1].polish); // Usunięcie słówka z błędów związanych z wpisywaniem
    } else {
        document.getElementById("feedback").innerText = "Spróbuj ponownie!";
        document.getElementById("hint").innerText = `Podpowiedź: ${words[currentWordIndex].english}`; // Wyświetlenie podpowiedzi
        document.getElementById("hint").style.display = "block"; // Pokazanie podpowiedzi
        showOptions(); // Pokazanie opcji do wyboru
        saveMistake('typed', words[currentWordIndex].polish); // Dodanie błędu do zapisania
        incorrectAnswers++; // Zwiększ licznik złych odpowiedzi
        updateScore(); // Aktualizacja wyników
    }
}

// Funkcja sprawdzająca wybraną odpowiedź
function showOptions() {
    const optionsDiv = document.getElementById("options");
    optionsDiv.innerHTML = ''; // Czyszczenie poprzednich opcji

    // Wybór 5 synonimów (w tym poprawny)
    const correctAnswer = words[currentWordIndex].synonyms[0]; // Poprawna odpowiedź
    const options = [correctAnswer];

    // Dodawanie losowych synonimów
    while (options.length < 5) {
        const randomWord = words[Math.floor(Math.random() * words.length)];
        const randomSynonym = randomWord.synonyms[0];
        if (!options.includes(randomSynonym)) {
            options.push(randomSynonym);
        }
    }

    // Tasowanie opcji
    options.sort(() => Math.random() - 0.5);

    // Tworzenie przycisków opcji
    options.forEach(option => {
        const button = document.createElement('button');
        button.innerText = option;
        button.onclick = () => checkSelectedAnswer(option);
        optionsDiv.appendChild(button);
    });

    optionsDiv.style.display = "block"; // Pokazanie opcji
}

// Funkcja sprawdzająca wybraną odpowiedź
function checkSelectedAnswer(selected) {
    const correctAnswersList = words[currentWordIndex].synonyms.map(s => s.toLowerCase());
    if (correctAnswersList.includes(selected.toLowerCase())) {
        document.getElementById("feedback").innerText = "Dobrze!";
        correctAnswers++; // Zwiększ licznik poprawnych odpowiedzi
        updateScore(); // Aktualizacja wyników
        currentWordIndex++;
        nextWord();
        clearMistake('selected', words[currentWordIndex - 1].polish); // Usunięcie słówka z błędów związanych z wyborem
    } else {
        document.getElementById("feedback").innerText = "Spróbuj ponownie!";
        showNewOptions(); // Wywołanie funkcji do pokazania nowych opcji
        incorrectAnswers++; // Zwiększ licznik złych odpowiedzi
        updateScore(); // Aktualizacja wyników
    }
}

// Funkcja pokazująca nowe opcje do wyboru
function showNewOptions() {
    const optionsDiv = document.getElementById("options");
    optionsDiv.innerHTML = ''; // Czyszczenie poprzednich opcji

    // Wybór 5 synonimów (w tym poprawny)
    const correctAnswer = words[currentWordIndex].synonyms[0]; // Poprawna odpowiedź
    const options = [correctAnswer];

    // Dodawanie losowych synonimów
    while (options.length < 5) {
        const randomWord = words[Math.floor(Math.random() * words.length)];
        const randomSynonym = randomWord.synonyms[0];
        if (!options.includes(randomSynonym)) {
            options.push(randomSynonym);
        }
    }

    // Tasowanie opcji
    options.sort(() => Math.random() - 0.5);

    // Tworzenie przycisków opcji
    options.forEach(option => {
        const button = document.createElement('button');
        button.innerText = option;
        button.onclick = () => checkSelectedAnswer(option);
        optionsDiv.appendChild(button);
    });

    optionsDiv.style.display = "block"; // Pokazanie opcji
}

// Funkcja sprawdzająca naciśnięcie klawisza Enter
function checkEnter(event) {
    if (event.key === "Enter") {
        checkAnswer(); // Sprawdzenie odpowiedzi po naciśnięciu klawisza Enter
    }
}

// Funkcja zakończenia quizu
function endQuiz() {
    // Zakończenie quizu i wyświetlenie przycisku powtórzenia
    document.getElementById("quiz").style.display = "none";
    document.getElementById("repeat-btn").style.display = "block";

    // Wyświetlanie błędnych odpowiedzi
    document.getElementById("polish-word").innerText = "Błędne słówka do powtórzenia: " + mistakesTyped.join(', ') + ", " + mistakesSelected.join(', ');
    document.getElementById("mistakes-count").innerText = `Złe odpowiedzi: ${mistakesTyped.length + mistakesSelected.length}`;

    // Wyświetlanie liczby poprawnych odpowiedzi
    document.getElementById("correct-count").innerText = `Poprawne odpowiedzi: ${correctAnswers}`;
}

// Funkcja powtarzania błędnych odpowiedzi
function repeatMistakes() {
    if (mistakesTyped.length > 0 || mistakesSelected.length > 0) {
        currentWordIndex = 0;
        words = [...mistakesTyped, ...mistakesSelected]; // Przypisz błędne odpowiedzi do words
        mistakesTyped = []; // Resetujemy błędy związane z wpisywaniem
        mistakesSelected = []; // Resetujemy błędy związane z wyborem
        document.getElementById("repeat-btn").style.display = "none";
        document.getElementById("quiz").style.display = "block";
        nextWord();
    } else {
        alert("Brak błędnych odpowiedzi do powtórzenia.");
    }
}

// Funkcja zapisywania błędnych odpowiedzi do localStorage
function saveMistake(type, word) {
    const mistakesArray = type === 'typed' ? mistakesTyped : mistakesSelected;
    if (!mistakesArray.includes(word)) {
        mistakesArray.push(word);
        localStorage.setItem(type, JSON.stringify(mistakesArray)); // Zapisanie do localStorage
    }
}

// Funkcja wczytywania błędnych odpowiedzi z localStorage
function loadMistakes(type) {
    const savedMistakes = localStorage.getItem(type);
    if (savedMistakes) {
        return JSON.parse(savedMistakes);
    }
    return [];
}

// Funkcja usuwania błędnych odpowiedzi (np. po poprawnym odpowiedzeniu)
function clearMistake(type, word) {
    const mistakesArray = type === 'typed' ? mistakesTyped : mistakesSelected;
    const index = mistakesArray.indexOf(word);
    if (index > -1) {
        mistakesArray.splice(index, 1);
        localStorage.setItem(type, JSON.stringify(mistakesArray)); // Zapisanie po usunięciu
    }
}

// Funkcja aktualizująca liczniki wyników
function updateScore() {
    document.getElementById("correct-count").innerText = `Poprawne odpowiedzi: ${correctAnswers}`;
    document.getElementById("incorrect-count").innerText = `Złe odpowiedzi: ${incorrectAnswers}`;
}

// Ładowanie domyślnego zestawu przy starcie strony
window.onload = () => {
    loadWords();
};
