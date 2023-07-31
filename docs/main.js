const KEYCODE_TAB = 9

const MAX_KEY_REPEAT = 5000 // At most one repeated key stroke every N ms.

const MAX_LINES = 1000

const UPDATE_CHECK_INTERVAL = 1 * 60 * 60 // Check for updates every 1 hour.

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
    // const disableRepeatingCharacters = (event) => {
    //     if (event.repeat) {
    //         event.preventDefault()
    //     }
    // }

    // Disable repeating characters if keyboard button is long-pressed.
    let lastChar = null
    let lastKeydown = null
    const disableRepeatingCharacters = (event) => {
        if (lastChar === event.key && Date.now() - lastKeydown < MAX_KEY_REPEAT) {
            event.preventDefault()
            return
        }

        lastKeydown = Date.now()
        lastChar = event.key
    }
    textArea.addEventListener('keydown', disableRepeatingCharacters)
    const resetRepeatingCharacters = () => {
        lastChar = null
        lastKeydown = null
    }
    textArea.addEventListener('keyup', resetRepeatingCharacters)

    const truncateIfNecessary = (event) => {
        const value = event.target.value
        const lines = value.split(/\n/)
        if (lines.length > MAX_LINES) {
            lines.splice(0, lines.length - MAX_LINES)
            event.target.value = lines.join('\n')
        }
    }
    textArea.addEventListener('keyup', truncateIfNecessary)

    // Auto-focus on input field when page loads.
    setTimeout(() => {
        textArea.focus()
    }, 0)

    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("./service-worker.js")
            .then(registration => {
                console.log("Registration done", registration)

                registration.addEventListener('updatefound', () => {
                    console.log('Service Worker update detected!');
                });

                setInterval(() => {
                    console.log('Checking for updates')
                    registration.update()
                }, UPDATE_CHECK_INTERVAL * 1000);

                registration.active.postMessage({
                    msg: 'CACHE_NAME'
                })
            })
            .catch(error => {
                console.error("Failed to register service worker", error)
            })

        let refreshing = false;

        // Detect controller change and refresh the page
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('Controller changed', refreshing)
            if (!refreshing) {
                window.location.reload()
                refreshing = true
            }
        })

        navigator.serviceWorker.addEventListener("message", ({ data: { msg, value } }) => {
            switch (msg) {
                case 'CACHE_NAME':
                    document.getElementById('appVersion').innerHTML = value
                    break
            }
        });
    }
}