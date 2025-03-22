const stocks = [];
let totalInvested = 0;
let currentValue = 0;

document.addEventListener('DOMContentLoaded', () => {
    const stockForm = document.getElementById('stock-form');
    const stockList = document.getElementById('stock-list');
    const totalInvestedElement = document.getElementById('total-invested');
    const currentValueElement = document.getElementById('current-value');
    const percentageChangeElement = document.getElementById('percentage-change');
    const dialog = document.getElementById('dialog');
    const closeDialogButton = document.getElementById('close-dialog');
    const noteForm = document.getElementById('note-form');
    const notesList = document.getElementById('notes-list');
    const noteInput = document.getElementById('note-input');
    const saveNoteButton = document.getElementById('save-note');
    
    let stocks = [];
    let currentStockIndex = null;
    
    stockForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const stockName = document.getElementById('stock-name').value;
        const stockPrice = parseFloat(document.getElementById('stock-price').value);
        const numberOfShares = parseInt(document.getElementById('number-of-shares').value);

        if (stockName && !isNaN(stockPrice) && !isNaN(numberOfShares)) {
            addStock(stockName, stockPrice, numberOfShares);
            stockForm.reset();
        }
    });
    
    closeDialogButton.addEventListener('click', () => {
        dialog.classList.add('hidden');
    });
    
    saveNoteButton.addEventListener('click', () => {
        const noteText = noteInput.value.trim();
        if (noteText && currentStockIndex !== null) {
            addNoteToStock(currentStockIndex, noteText);
            noteInput.value = '';
        }
    });

    function addStock(name, price, shares) {
        const stock = {
            name,
            price,
            shares,
            gainLoss: calculateGainLoss(price, shares),
            percentage: calculatePercentage(price, shares),
            notes: []
        };
        stocks.push(stock);
        updatePortfolio();
    }

    function calculateGainLoss(price, shares) {
        // Placeholder for actual current value calculation
        const currentPrice = price * 1.1; // Example: 10% gain
        return (currentPrice - price) * shares;
    }

    function calculatePercentage(price, shares) {
        const currentPrice = price * 1.1; // Example: 10% gain
        return ((currentPrice - price) / price) * 100;
    }

    function updatePortfolio() {
        const totalInvested = stocks.reduce((acc, stock) => acc + (stock.price * stock.shares), 0);
        const currentValue = stocks.reduce((acc, stock) => acc + (stock.price * stock.shares * 1.1), 0); // Example: 10% gain

        totalInvestedElement.textContent = `$${totalInvested.toFixed(2)}`;
        currentValueElement.textContent = `$${currentValue.toFixed(2)}`;
        percentageChangeElement.textContent = `${((currentValue - totalInvested) / totalInvested * 100).toFixed(2)}%`;

        renderStockList();
    }

    function renderStockList() {
        stockList.innerHTML = '';
        stocks.forEach((stock, index) => {
            const li = document.createElement('li');
            li.className = 'p-3 hover:bg-gray-100 cursor-pointer flex justify-between items-center';
            
            const stockInfo = document.createElement('div');
            stockInfo.innerHTML = `
                <span class="font-medium">${stock.name}</span>: 
                <span>$${stock.price.toFixed(2)} × ${stock.shares} shares</span>`;
            
            const stockMetrics = document.createElement('div');
            const gainLossClass = stock.gainLoss >= 0 ? 'text-green-600' : 'text-red-600';
            stockMetrics.innerHTML = `
                <span class="${gainLossClass}">
                    $${stock.gainLoss.toFixed(2)} (${stock.percentage.toFixed(2)}%)
                </span>
                <span class="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    ${stock.notes.length} notes
                </span>`;
            
            li.appendChild(stockInfo);
            li.appendChild(stockMetrics);
            
            li.addEventListener('click', () => openStockDialog(index));
            stockList.appendChild(li);
        });
    }
    
    function openStockDialog(stockIndex) {
        currentStockIndex = stockIndex;
        const stock = stocks[stockIndex];
        
        document.querySelector('#dialog h2').textContent = `Notes for ${stock.name}`;
        renderNotes(stock.notes);
        dialog.classList.remove('hidden');
    }
    
    function renderNotes(notes) {
        notesList.innerHTML = '';
        if (notes.length === 0) {
            const emptyNote = document.createElement('li');
            emptyNote.textContent = 'No notes yet.';
            emptyNote.className = 'text-gray-500 italic';
            notesList.appendChild(emptyNote);
            return;
        }
        
        notes.forEach(note => {
            const noteItem = document.createElement('li');
            noteItem.className = 'border-b py-2';
            noteItem.innerHTML = `
                <p>${note.text}</p>
                <p class="text-sm text-gray-500">${note.timestamp}</p>
            `;
            notesList.appendChild(noteItem);
        });
    }
    
    function addNoteToStock(stockIndex, noteText) {
        const note = {
            text: noteText,
            timestamp: new Date().toLocaleString()
        };
        
        stocks[stockIndex].notes.push(note);
        renderNotes(stocks[stockIndex].notes);
        renderStockList(); // Update the note count in the list
    }
});