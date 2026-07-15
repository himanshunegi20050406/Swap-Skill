// tts.js - Text-to-Speech Accessibility Module for SwapSkill

function initTTS() {
    const ttsBtn = document.getElementById('tts-btn');
    if (!ttsBtn) return; // If the button isn't on this page, do nothing.

    let isSpeaking = false;
    let currentUtterance = null;

    function toggleSpeech() {
        // If it's already talking, stop it.
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            ttsBtn.classList.remove('playing');
            ttsBtn.innerText = '🔊 Read Page';
            isSpeaking = false;
            return;
        }

        // 1. Find the main content area (avoids reading the sidebar over and over)
        // Checks for main-area (Messenger), container (Discover), or falls back to body
        const mainArea = document.querySelector('.main-area') || document.querySelector('.container') || document.body;
        
        // 2. Clone the content so we can manipulate it without changing the real website
        const clone = mainArea.cloneNode(true);
        
        // 3. Strip out hidden elements, modals, and the TTS button itself
        const hiddenElements = clone.querySelectorAll('[style*="display: none"], script, style, #tts-btn, .modal-overlay, .modal');
        hiddenElements.forEach(el => el.remove());
        
        // 4. Extract the clean text using textContent (safer for cloned nodes)
        let contentToRead = clone.textContent.replace(/\s+/g, ' ').trim();
        
        if (!contentToRead || contentToRead === "Loading...") {
            contentToRead = "The content on this page is currently empty or loading.";
        }

        // 5. Clear any stuck browser audio queues
        window.speechSynthesis.cancel();

        // 6. Configure the voice
        currentUtterance = new SpeechSynthesisUtterance(contentToRead);
        currentUtterance.lang = 'en-US'; 
        currentUtterance.rate = 1.0;     
        currentUtterance.pitch = 1.0;    

        // 7. UI Updates when speaking starts
        currentUtterance.onstart = () => {
            isSpeaking = true;
            ttsBtn.classList.add('playing'); 
            ttsBtn.innerText = '⏹️ Stop Reading';
        };

        // 8. UI Updates when speaking finishes naturally or encounters an error
        currentUtterance.onend = resetUI;
        currentUtterance.onerror = resetUI;

        // Let's talk!
        window.speechSynthesis.speak(currentUtterance);
    }

    function resetUI() {
        isSpeaking = false;
        ttsBtn.classList.remove('playing');
        ttsBtn.innerText = '🔊 Read Page';
    }

    // --- EVENT LISTENERS ---
    
    // Mouse Click (Slight delay fixes a Chrome bug where the queue gets stuck)
    ttsBtn.addEventListener('click', () => {
        setTimeout(toggleSpeech, 50); 
    });

    // Keyboard Shortcut (Alt + S)
    document.addEventListener('keydown', (e) => {
        if (e.altKey && e.key.toLowerCase() === 's') {
            e.preventDefault();
            toggleSpeech();
        }
    });

    // Immediately stop talking if the user closes the tab or hits the back button
    window.addEventListener('beforeunload', () => {
        window.speechSynthesis.cancel();
    });
}

// Ensure it runs regardless of when the script is loaded in the HTML
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTTS);
} else {
    initTTS();
}
