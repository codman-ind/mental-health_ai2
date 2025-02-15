document.getElementById("journalForm").addEventListener("submit", async function(event) {
    event.preventDefault();
    const entry = document.getElementById("journalEntry").value;

    const response = await fetch('/journal/add', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entry })
    });

    if (response.ok) {
        document.getElementById("journalEntry").value = ""; 
        fetchEntries(); 
    } else {
        alert("Error saving entry.");
    }
});

async function fetchEntries() {
    const response = await fetch('/journal');
    const entries = await response.json();
    const list = document.getElementById("entriesList");
    
    list.innerHTML = entries.map(e => `
        <li class="flex justify-between items-center bg-gray-100 p-3 rounded-lg shadow-sm my-2">
            <span>${e.entry} - <small class="text-gray-500">${new Date(e.createdAt).toLocaleDateString()}</small></span>
            <button onclick="deleteEntry('${e._id}')" class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-700 transition">
                Delete
            </button>
        </li>
    `).join("");
}

async function deleteEntry(id) {
    const response = await fetch(`/journal/delete/${id}`, {
        method: "DELETE"
    });

    if (response.ok) {
        fetchEntries(); 
    } else {
        alert("Error deleting entry.");
    }
}

fetchEntries();
