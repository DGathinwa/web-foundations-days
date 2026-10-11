// 1. Select elements
const textarea = document.querySelector("#note-text");
const charCountDisplay = document.querySelector("#char-count");
const wordCountDisplay = document.querySelector("#word-count");
const clearBtn = document.querySelector("#clear-btn");
const themeToggleBtn = document.querySelector("#theme-toggle");
 
const DRAFT_KEY = "quicknotes_draft";
const THEME_KEY = "quicknotes_theme";
 
// 2. Update character count, word count, and styling classes
function updateCounts() {
  const text = textarea.value;
  const charCount = text.length;
  
  const trimmed = text.trim();
  const words = trimmed === "" ? 0 : trimmed.split(/\s+/).length;
 
  charCountDisplay.textContent = `${charCount} / 200 characters`;
  wordCountDisplay.textContent = `${words} words`;
 
  // Reset classes
  charCountDisplay.classList.remove("warning", "over");
 
  // Apply conditional classes
  if (charCount > 200) {
    charCountDisplay.classList.add("over");
  } else if (charCount > 180) {
    charCountDisplay.classList.add("warning");
  }
}
 
// 3. Save draft to localStorage
function saveDraft() {
  localStorage.setItem(DRAFT_KEY, textarea.value);
}
 
// 4. Clear textarea, draft, and reset counters
function clearDraft() {
  textarea.value = "";
  localStorage.removeItem(DRAFT_KEY);
  updateCounts();
  textarea.focus();
}
 
// 5. Theme management
function setTheme(isDark) {
  if (isDark) {
    document.body.classList.add("dark");
    themeToggleBtn.textContent = "Light mode";
    localStorage.setItem(THEME_KEY, "dark");
  } else {
    document.body.classList.remove("dark");
    themeToggleBtn.textContent = "Dark mode";
    localStorage.setItem(THEME_KEY, "light");
  }
}
 
function toggleTheme() {
  const isDark = !document.body.classList.contains("dark");
  setTheme(isDark);
}
 
// 6. Event Listeners
textarea.addEventListener("input", () => {
  updateCounts();
  saveDraft();
});
 
textarea.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    clearDraft();
  }
});
 
clearBtn.addEventListener("click", clearDraft);
 
themeToggleBtn.addEventListener("click", toggleTheme);
 
// 7. Initialization on page load
function init() {
  // Restore draft
  const savedDraft = localStorage.getItem(DRAFT_KEY);
  if (savedDraft !== null) {
    textarea.value = savedDraft;
  }
 
  // Restore theme preference
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme === "dark") {
    setTheme(true);
  } else {
    setTheme(false);
  }
 
  // Initial count update
  updateCounts();
}
 
init();