function initAI() {

    const chatMessages = document.getElementById('chat-messages')
    const userInput = document.getElementById('user-input')
    
    if (!chatMessages || !userInput) return

    // ================= RENDER =================
    function appendMessage(text, sender) {
        const msgDiv = document.createElement('div')
        msgDiv.className = `message ${sender}`
        
        msgDiv.innerHTML = `
            <div class="avatar">${sender === 'ai' ? '🤖' : '👤'}</div>
            <div class="bubble">${text}</div>
        `
        
        chatMessages.appendChild(msgDiv)
        chatMessages.scrollTop = chatMessages.scrollHeight
    }

    // ================= API =================
    async function sendMessage() {
        const message = userInput.value.trim()
        if (!message) return

        appendMessage(message, 'user')
        userInput.value = ''

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: message })
            })
            
            const data = await response.json()
            appendMessage(data.reply, 'ai')
        } catch (error) {
            console.error('Error:', error)
            appendMessage('Có lỗi xảy ra, vui lòng thử lại.', 'ai')
        }
    }

    // ================= EVENTS =================
    const sendBtn = document.querySelector('.chat-input-area button:last-child')
    if (sendBtn) {
        sendBtn.addEventListener('click', sendMessage)
    }

    userInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage()
    })


}