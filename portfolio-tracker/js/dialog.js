document.addEventListener('DOMContentLoaded', () => {
    const dialog = document.getElementById('dialog');
    const openDialogButton = document.getElementById('open-dialog');
    const closeDialogButton = document.getElementById('close-dialog');
    const noteForm = document.getElementById('note-form');
    const notesList = document.getElementById('notes-list');

    openDialogButton.addEventListener('click', () => {
        dialog.classList.remove('hidden');
    });

    closeDialogButton.addEventListener('click', () => {
        dialog.classList.add('hidden');
    });

    noteForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const noteInput = document.getElementById('note-input');
        const noteText = noteInput.value;
        const timestamp = new Date().toLocaleString();

        if (noteText) {
            const noteItem = document.createElement('li');
            noteItem.textContent = `${noteText} - ${timestamp}`;
            notesList.appendChild(noteItem);
            noteInput.value = '';
        }
    });
});