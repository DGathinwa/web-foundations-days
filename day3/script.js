// Starting data
let notes = [
  { id: 1, text: "Buy milk and bread", category: "personal" },
  { id: 2, text: "Finish the Day 3 assignment", category: "study" },
  { id: 3, text: "Email the project report to Grace", category: "work" },
  { id: 4, text: "Revise JavaScript arrays", category: "study" },
  { id: 5, text: "Call mum", category: "personal" },
];

// 1. searchNotes(word) - returns array of notes matching word (case-insensitive)
function searchNotes(word) {
  const query = word.toLowerCase();
  return notes.filter((note) => note.text.toLowerCase().includes(query));
}

// 2. longestNote() - returns note object with the most characters, or null if empty
function longestNote() {
  if (notes.length === 0) return null;
  let longest = notes[0];
  for (const note of notes) {
    if (note.text.length > longest.text.length) {
      longest = note;
    }
  }
  return longest;
}

// 3. countByCategory() - returns an object counting notes per category
function countByCategory() {
  const counts = {};
  for (const note of notes) {
    counts[note.category] = (counts[note.category] || 0) + 1;
  }
  return counts;
}

// 4. getSummary() - returns sentence summary with proper pluralization
function getSummary() {
  if (notes.length === 0) return "0 notes.";
  const counts = countByCategory();
  const parts = [];
  for (const cat in counts) {
    parts.push(`${counts[cat]} ${cat}`);
  }
  const noteWord = notes.length === 1 ? "note" : "notes";
  return `${notes.length} ${noteWord}: ${parts.join(", ")}.`;
}

// 5. isDuplicate(text) - checks if normalized text already exists
function isDuplicate(text) {
  const cleanedInput = text.trim().toLowerCase();
  return notes.some((note) => note.text.trim().toLowerCase() === cleanedInput);
}

// 6. addNote(text, category) - adds a note if valid, unique, and category is allowed
function addNote(text, category) {
  const validCategories = ["personal", "work", "study"];
  const cleanedText = text.trim();

  if (cleanedText.length < 1 || cleanedText.length > 200) {
    console.log(`❌ Rejected "${text}": must be 1-200 characters.`);
    return false;
  }
  if (!validCategories.includes(category)) {
    console.log(`❌ Rejected "${text}": invalid category "${category}". Must be personal, work, or study.`);
    return false;
  }
  if (isDuplicate(text)) {
    console.log(`❌ Rejected "${text}": duplicate note already exists.`);
    return false;
  }

  const newNote = {
    id: Date.now(),
    text: cleanedText,
    category: category,
  };
  notes.push(newNote);
  console.log(`✅ Added note: "${cleanedText}" (${category})`);
  return true;
}

// --- Testing all functions with normal and edge cases ---

// Test 1: searchNotes
console.log(searchNotes("day 3")); 
// Expected: [{ id: 2, text: "Finish the Day 3 assignment", category: "study" }]

console.log(searchNotes("python")); 
// Expected: []

// Test 2: longestNote
console.log(longestNote()); 
// Expected: { id: 2, text: "Finish the Day 3 assignment", category: "study" }

// Test 3: countByCategory
console.log(countByCategory()); 
// Expected: { personal: 2, study: 2, work: 1 } (order may vary)

// Test 4: getSummary
console.log(getSummary()); 
// Expected: "5 notes: 2 personal, 2 study, 1 work."

// Test 5: isDuplicate
console.log(isDuplicate("call mum")); 
// Expected: true

console.log(isDuplicate("Learn React")); 
// Expected: false

// Test 6: addNote
addNote("Buy groceries", "personal"); 
// Expected: ✅ Added note: "Buy groceries" (personal) -> returns true

addNote("Call mum", "personal"); 
// Expected: ❌ Rejected "Call mum": duplicate note already exists. -> returns false

addNote("", "work"); 
// Expected: ❌ Rejected "": must be 1-200 characters. -> returns false

addNote("Fix critical bug", "fitness"); 
// Expected: ❌ Rejected "Fix critical bug": invalid category "fitness". -> returns false