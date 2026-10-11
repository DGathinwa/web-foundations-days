const API_URL = "https://jsonplaceholder.typicode.com/users";
 
const loadBtn = document.querySelector("#load-users");
const filterInput = document.querySelector("#filter-input");
const statusText = document.querySelector("#status");
const listContainer = document.querySelector("#users-list");
 
let allUsers = [];
 
// Render users array safely using DOM creation methods
function renderUsers(users) {
  listContainer.innerHTML = "";
 
  if (users.length === 0 && allUsers.length > 0) {
    const li = document.createElement("li");
    li.textContent = "No users match your filter.";
    listContainer.appendChild(li);
    return;
  }
 
  users.forEach((user) => {
    const li = document.createElement("li");
    li.style.marginBottom = "12px";
    li.style.padding = "12px";
    li.style.border = "1px solid #ccc";
    li.style.borderRadius = "6px";
    li.style.backgroundColor = "#fff";
 
    const nameStrong = document.createElement("strong");
    nameStrong.textContent = user.name;
    li.appendChild(nameStrong);
 
    const details = document.createElement("div");
    details.textContent = `Email: ${user.email} | City: ${user.address.city} | Company: ${user.company.name}`;
    details.style.fontSize = "0.9rem";
    details.style.color = "#555";
    li.appendChild(details);
 
    listContainer.appendChild(li);
  });
}
 
// Load users from API with async/await and robust error handling
async function loadUsers() {
  statusText.textContent = "Loading users...";
  loadBtn.disabled = true;
  listContainer.innerHTML = "";
  allUsers = [];
  filterInput.value = "";
 
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }
    allUsers = await response.json();
    renderUsers(allUsers);
    statusText.textContent = `Successfully loaded ${allUsers.length} users.`;
  } catch (error) {
    statusText.textContent = "Could not load users. Please try again.";
    console.error(error);
  } finally {
    loadBtn.disabled = false;
  }
}
 
// Event listeners
loadBtn.addEventListener("click", loadUsers);
 
filterInput.addEventListener("input", () => {
  const query = filterInput.value.trim().toLowerCase();
  const filtered = allUsers.filter((user) =>
    user.name.toLowerCase().includes(query)
  );
  renderUsers(filtered);
});