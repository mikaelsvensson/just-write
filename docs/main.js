const KEYCODE_TAB = 9

function init() {
    const textArea = document.getElementById('textInput')

    // Restore input from previous session
    const previousText = localStorage.getItem('text')
    textArea.value = previousText || ''

    // Enable auto-saving.
    const saveCurrentInput = () => {
        localStorage.setItem('text', textArea.value)
    }
    textArea.addEventListener('keyup', saveCurrentInput)

    // Prevent user from moving the input caret, effectively ensuring that text is always appended (never inserted).
    const moveInputCaretToEnd = () => {
        const length = textArea.value.length
        textArea.setSelectionRange(length, length)
    }
    textArea.addEventListener('click', moveInputCaretToEnd)

    // Make sure text field is always focused, even if user presses the Tab key.
    const preventChangingFocus = (e) => {
        const isTabPressed = (e.key === 'Tab' || e.keyCode === KEYCODE_TAB)
        if (isTabPressed) {
            if (document.activeElement === textArea) {
                e.preventDefault()
            }
        }
    }
    textArea.addEventListener('keydown', preventChangingFocus)
    
    // Disable repeating characters if keyboard button is long-pressed.
    const disableRepeatingCharacters = (event) => {
        if (event.repeat) {
            event.preventDefault()
        }
    }
    textArea.addEventListener('keydown', disableRepeatingCharacters)

    // Auto-focus on input field when page loads.
    setTimeout(() => {
        textArea.focus()
    }, 0)

    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("./service-worker.js")
            .then(registration => {
                console.log("Registration done", registration)
            })
            .catch(error => {
                console.error("Failed to register service worker", error)
            })
    }
}