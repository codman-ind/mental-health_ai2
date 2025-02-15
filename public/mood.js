document.querySelectorAll(".mood-btn").forEach(button => {
    button.addEventListener("click", async function() {
        const mood = this.getAttribute("data-mood");
        
        const response = await fetch("/mood/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mood })
        });
        
        if (response.ok) {
            fetchMoodData();
        } else {
            alert("Error saving mood.");
        }
    });
});

let moodChart = null; 

async function fetchMoodData() {
    const response = await fetch("/mood");
    const data = await response.json();

    if (!data || data.length === 0) {
        console.warn("No mood data found.");
        return;
    }

    const labels = data.map(entry => new Date(entry.createdAt).toLocaleDateString());

    const moodMapping = {
        "happy": 5,
        "neutral": 3,
        "sad": 2,
        "very_sad": 1
    };

    const moodValues = data.map(entry => moodMapping[entry.mood] || 0);

    const ctx = document.getElementById("moodChart").getContext("2d");

    
    if (moodChart !== null) {
        moodChart.destroy();
    }

    moodChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Mood Trend",
                data: moodValues,
                borderColor: "#4CAF50",
                fill: false,
                tension: 0.3
            }]
        },
        options: {
            scales: {
                y: {
                    min: 0,
                    max: 5,
                    ticks: {
                        stepSize: 1,
                        callback: value => {
                            return Object.keys(moodMapping).find(key => moodMapping[key] === value) || "";
                        }
                    }
                }
            }
        }
    });
}

fetchMoodData();
