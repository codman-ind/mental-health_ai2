let isMuted = false; 

async function sendMessage() {
    const userMessage = document.getElementById("user-input").value;
    if (!userMessage.trim()) return;

    const chatBox = document.getElementById("chat-box");

    
    chatBox.innerHTML += `<p><b>You:</b> ${userMessage}</p>`;
    
    
    saveToLocalStorage("You", userMessage);

    document.getElementById("user-input").value = "";

    const response = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage })
    });

    const data = await response.json();
    const botReply = data.reply;

    
    chatBox.innerHTML += `<p><b>Friend:</b> ${botReply}</p>`;
    
    
    saveToLocalStorage("Friend", botReply);

    if (!isMuted) {
        speakText(botReply);
    }
}


function saveToLocalStorage(sender, message) {
    let chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];
    chatHistory.push({ sender, message });
    localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
}


function loadChatHistory() {
    const chatBox = document.getElementById("chat-box");
    const chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];
    chatBox.innerHTML = ""; // Clear placeholder text

    chatHistory.forEach(entry => {
        chatBox.innerHTML += `<p><b>${entry.sender}:</b> ${entry.message}</p>`;
    });
}


window.onload = loadChatHistory;


function speakText(text) {
    const speech = new SpeechSynthesisUtterance(removeEmojis(text));
    speech.lang = "en-US";  
    speech.rate = 1;  
    speech.pitch = 1; 
    
    window.speechSynthesis.speak(speech);
}


function removeEmojis(text) {
    return text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "");
}

function toggleMute() {
    isMuted = !isMuted;
    document.getElementById("mute-btn").innerHTML = isMuted ?  '<i class="ri-volume-mute-fill"></i>'  : '<i class="ri-volume-up-fill"></i>';
    }


function clearChat() {
    localStorage.removeItem("chatHistory");
    document.getElementById("chat-box").innerHTML = '<p class="text-center text-gray-600">Start the conversation...</p>';
}