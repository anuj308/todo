// This file contains functions related to portfolio management, such as calculating total invested, current value, gain/loss, and percentage change. It also handles the logic for displaying stocks and their details.

let stocks = [];
let totalInvested = 0;
let currentValue = 0;

function addStock(name, price, shares) {
    const stock = {
        name: name,
        price: parseFloat(price),
        shares: parseInt(shares),
        gainLoss: 0,
        percentageChange: 0
    };
    stocks.push(stock);
    updatePortfolio();
}

function updatePortfolio() {
    totalInvested = stocks.reduce((total, stock) => total + (stock.price * stock.shares), 0);
    currentValue = stocks.reduce((total, stock) => total + (stock.price * stock.shares), 0); // Placeholder for current value calculation
    calculateGainLoss();
    displayStocks();
}

function calculateGainLoss() {
    stocks.forEach(stock => {
        stock.gainLoss = (stock.currentValue || stock.price) * stock.shares - (stock.price * stock.shares);
        stock.percentageChange = ((stock.gainLoss / (stock.price * stock.shares)) * 100) || 0;
    });
}

function displayStocks() {
    const stockList = document.getElementById('stock-list');
    stockList.innerHTML = '';
    stocks.forEach(stock => {
        const listItem = document.createElement('li');
        listItem.textContent = `${stock.name}: Price: $${stock.price}, Shares: ${stock.shares}, Gain/Loss: $${stock.gainLoss.toFixed(2)}, Percentage: ${stock.percentageChange.toFixed(2)}%`;
        stockList.appendChild(listItem);
    });
}

function getTotalInvested() {
    return totalInvested;
}

function getCurrentValue() {
    return currentValue;
}

function getPercentageChange() {
    return ((currentValue - totalInvested) / totalInvested) * 100 || 0;
}