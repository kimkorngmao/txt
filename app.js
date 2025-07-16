const editor = document.getElementById('editor');
const lineNumbers = document.getElementById('lineNumbers');
const toggleBtn = document.getElementById('toggleTheme');
const body = document.body;

const lightIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-700 dark:text-gray-300" viewBox="0 0 24 24"><path fill="currentColor" d="m15.844 3.344l-1.428.781l1.428.781l.781 1.428l.781-1.428l1.428-.781l-1.428-.781l-.781-1.428l-.781 1.428Zm-5.432.814A8 8 0 1 0 18.93 16A9 9 0 0 1 10 7c0-.98.131-1.937.412-2.842ZM2 12C2 6.477 6.477 2 12 2h1.734l-.868 1.5C12.287 4.5 12 5.69 12 7a7 7 0 0 0 8.348 6.87l1.682-.327l-.543 1.626C20.162 19.137 16.417 22 12 22C6.477 22 2 17.523 2 12Zm18.5-5.584l.914 1.67l1.67.914l-1.67.914l-.914 1.67l-.914-1.67L17.916 9l1.67-.914l.914-1.67Z"/></svg>`;
const darkIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-700 dark:text-gray-300" viewBox="0 0 24 24"><path fill="currentColor" d="M10.999-.004h2.004V2h-2.004V-.004ZM4.223 2.803L5.64 4.22L4.223 5.637L2.806 4.22l1.417-1.417Zm15.556 0l1.417 1.417l-1.417 1.417l-1.417-1.417l1.417-1.417ZM12 6a6 6 0 1 0 0 12a6 6 0 0 0 0-12Zm-8 6a8 8 0 1 1 16 0a8 8 0 0 1-16 0Zm-4.001-1.004h2.004V13H-.001v-2.004Zm22 0h2.004V13h-2.004v-2.004ZM4.223 18.36l1.417 1.417l-1.417 1.418l-1.417-1.418l1.417-1.417Zm15.556 0l1.417 1.417l-1.417 1.417l-1.417-1.417l1.417-1.416ZM11 21.997h2.004V24H11v-2.004Z"/></svg>`;

// Save content to localStorage
function saveContent() {
    localStorage.setItem('editorContent', editor.innerHTML);
}

// Load content from localStorage
function loadContent() {
    const savedContent = localStorage.getItem('editorContent');
    if (savedContent) {
        editor.innerHTML = savedContent;
        editor.classList.toggle('empty', editor.innerText.trim() === '');
        updateLineNumbers();
    }
}

function setTheme(theme) {
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    toggleBtn.innerHTML = theme === 'light' ? darkIcon : lightIcon;
    localStorage.setItem('theme', theme);
}

toggleBtn.addEventListener('click', () => {
    const current = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    setTheme(current === 'light' ? 'dark' : 'light');
});

function updateLineNumbers() {
    const childNodes = editor.childNodes;
    let lines = 0;

    if (childNodes.length === 0) {
        lines = 1;
    } else {
        lines = childNodes.length;
        // Special case: if the last node is a <br> added by browser, don't count it as a line
        const lastNode = childNodes[childNodes.length - 1];
        if (lastNode.nodeName === 'BR') {
            lines -= 1;
        }
    }

    let linesHTML = '';
    for (let i = 1; i <= lines; i++) {
        linesHTML += i + '<br>';
    }

    lineNumbers.innerHTML = linesHTML;
}

editor.addEventListener('input', () => {
    editor.classList.toggle('empty', editor.innerText.trim() === '');
    updateLineNumbers();
    saveContent();
});

editor.addEventListener('keydown', function (e) {
    if (e.key === 'Tab') {
        e.preventDefault();
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const tabNode = document.createTextNode('  ');
        range.insertNode(tabNode);
        range.setStartAfter(tabNode);
        range.setEndAfter(tabNode);
        selection.removeAllRanges();
        selection.addRange(range);
        updateLineNumbers();
        saveContent();
    }
});

editor.addEventListener('scroll', () => {
    lineNumbers.scrollTop = editor.scrollTop;
});

// Load saved theme or use light by default
const savedTheme = localStorage.getItem('theme') || 'light';
setTheme(savedTheme);

// Font size functionality
const fontSizeDecrease = document.getElementById('fontSizeDecrease');
const fontSizeIncrease = document.getElementById('fontSizeIncrease');
const MIN_FONT_SIZE = 8;
const MAX_FONT_SIZE = 72;

function getCurrentFontSize() {
    const size = parseFloat(window.getComputedStyle(editor).fontSize);
    return size || 14;
}

function setFontSize(size) {
    const newSize = Math.min(Math.max(size, MIN_FONT_SIZE), MAX_FONT_SIZE);
    // Set font size
    editor.style.fontSize = `${newSize}px`;
    lineNumbers.style.fontSize = `${newSize}px`;
    // Set line height (1.5 times the font size for good readability)
    const lineHeight = `${newSize * 1.5}px`;
    editor.style.lineHeight = lineHeight;
    lineNumbers.style.lineHeight = lineHeight;
    localStorage.setItem('fontSize', newSize);
}

function changeFontSize(delta) {
    const currentSize = getCurrentFontSize();
    setFontSize(currentSize + delta);
}

fontSizeDecrease.addEventListener('click', () => changeFontSize(-2));
fontSizeIncrease.addEventListener('click', () => changeFontSize(2));

// Load saved font size
const savedFontSize = localStorage.getItem('fontSize');
if (savedFontSize) {
    setFontSize(parseFloat(savedFontSize));
}

// Add keyboard shortcuts for font size
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        changeFontSize(2);
    } else if (e.ctrlKey && e.key === '-') {
        e.preventDefault();
        changeFontSize(-2);
    }
});

// Format removal functionality
const formatBtn = document.getElementById('formatBtn');
const formatOptions = document.getElementById('formatOptions');

formatBtn.addEventListener('click', () => {
    formatOptions.classList.toggle('show');
});

// Close format options when clicking outside
document.addEventListener('click', (e) => {
    if (!formatBtn.contains(e.target) && !formatOptions.contains(e.target)) {
        formatOptions.classList.remove('show');
    }
});

formatOptions.addEventListener('click', (e) => {
    const button = e.target.closest('button');
    if (!button) return;

    const format = button.dataset.format;
    const selection = window.getSelection();

    if (selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const selectedContent = range.cloneContents();
    const tempDiv = document.createElement('div');
    tempDiv.appendChild(selectedContent);

    // Process the content based on the selected format option
    const processContent = () => {
        switch (format) {
            case 'all':
                // Remove all formatting by extracting text content
                return document.createTextNode(tempDiv.textContent);
            case 'background':
                // Remove only background styles
                tempDiv.querySelectorAll('*').forEach(el => {
                    el.style.backgroundColor = '';
                    if (el.getAttribute('style') === '') el.removeAttribute('style');
                });
                return tempDiv;
            case 'color':
                // Remove text colors
                tempDiv.querySelectorAll('*').forEach(el => {
                    el.style.color = '';
                    if (el.getAttribute('style') === '') el.removeAttribute('style');
                });
                return tempDiv;
            case 'style':
                // Remove font styles (bold, italic, etc.)
                tempDiv.querySelectorAll('*').forEach(el => {
                    el.style.fontWeight = '';
                    el.style.fontStyle = '';
                    el.style.textDecoration = '';
                    if (el.getAttribute('style') === '') el.removeAttribute('style');
                });
                return tempDiv;
        }
    };

    const processedContent = processContent();
    range.deleteContents();
    range.insertNode(processedContent);

    formatOptions.classList.remove('show');
    updateLineNumbers();
    saveContent();
});

// Download functionality
const downloadBtn = document.getElementById('downloadBtn');

downloadBtn.addEventListener('click', () => {
    // Get the text content
    const content = editor.innerText;

    // Create a blob with the text content
    const blob = new Blob([content], { type: 'text/plain' });

    // Create a temporary download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');

    // Get current date and time for the filename
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 19).replace(/[:]/g, '-');

    // Set download attributes
    a.href = url;
    a.download = `text_${timestamp}.txt`;

    // Trigger the download
    document.body.appendChild(a);
    a.click();

    // Clean up
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
});

// Load saved content
loadContent();
updateLineNumbers();