const sendBtn = document.getElementById('sendBtn');
const userInput = document.getElementById('userInput');
const messagesBox = document.getElementById('messagesBox');

function appendMessage(text, side) {
    if(!text.trim()) return;
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', side);
    msgDiv.innerText = text;
    messagesBox.appendChild(msgDiv);
    messagesBox.scrollTop = messagesBox.scrollHeight;
}

async function fetchAnswerAndShow(text){
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', 'system');
    
    // Add a glowing text cursor effect to show typing activity
    msgDiv.innerHTML = '<span class="cursor"></span>';
    messagesBox.appendChild(msgDiv);
    messagesBox.scrollTop = messagesBox.scrollHeight;

    try {
        // 3. Post data to your Express backend streaming server
        const response = await fetch('/ask', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: text })
        });

        if (!response.ok) throw new Error("Failed to contact streaming server");

        // 4. Initialize reader to parse raw network chunks
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let assistantResponse = "";

        while (true) {
            const { value, done } = await reader.read();
            if (done) break; // Network stream closed down gracefully

            // Decode binary stream data pack into strings
            const chunkText = decoder.decode(value, { stream: true });
            assistantResponse += chunkText;

            // Update UI with incoming text while preserving the trailing cursor animation
            msgDiv.innerHTML = assistantResponse + '<span class="cursor"></span>';
            messagesBox.scrollTop = messagesBox.scrollHeight;
        }

        // 5. Remove the typing cursor once the stream successfully finishes
        msgDiv.innerHTML = assistantResponse;

    } catch (err) {
        console.error(err);
        msgDiv.innerText = "Sorry, something went wrong !";

    }
}

sendBtn.addEventListener('click', async() => {
    if("vibrate" in navigator){
        navigator.vibrate(50);
    }
    if(document.querySelector(".greetings")){
        messagesBox.removeChild(document.querySelector(".greetings"))
    }
    appendMessage(userInput.textContent, 'user');
    let query = userInput.textContent;
    userInput.textContent = '';
    await fetchAnswerAndShow(query);
});

userInput.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
        if("vibrate" in navigator){
            navigator.vibrate(50);
        }
        if(document.querySelector(".greetings")){
            messagesBox.removeChild(document.querySelector(".greetings"))
        }
        appendMessage(userInput.textContent, 'user');
        let query = userInput.textContent;
        userInput.textContent = '';
        await fetchAnswerAndShow(query)
    }
});
document.querySelector(".close-btn").addEventListener("click",()=>{
    if("vibrate" in navigator){
        navigator.vibrate(50);
    }
    let interfaceEl = document.querySelector(".chat-interface-container");
    interfaceEl.classList.remove("fade-in");
    interfaceEl.classList.add("fade-out");

    setTimeout(()=>{
        document.querySelector(".chat-interface-container").classList.add("hidden");
    },500)

});