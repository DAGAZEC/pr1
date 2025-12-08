// Проверка связи
console.log("ЗАПУСК СКРИПТА: JS файл подключен успешно!");

import './style.css'
import Chart from 'chart.js/auto';

// URL API
const API_URL = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=pln&order=market_cap_desc&per_page=20&page=1&sparkline=false';

let coinsData = [];
let myChart = null;

// --- РЕЗЕРВНЫЕ ДАННЫЕ (ЧТОБЫ РАБОТАЛО ВСЕГДА) ---
const BACKUP_DATA = [
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'btc', image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png', current_price: 168432, price_change_percentage_24h: 1.25 },
  { id: 'ethereum', name: 'Ethereum', symbol: 'eth', image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png', current_price: 8950, price_change_percentage_24h: -0.54 },
  { id: 'tether', name: 'Tether', symbol: 'usdt', image: 'https://assets.coingecko.com/coins/images/325/large/Tether.png', current_price: 4.02, price_change_percentage_24h: 0.01 },
  { id: 'binancecoin', name: 'BNB', symbol: 'bnb', image: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png', current_price: 980, price_change_percentage_24h: 2.10 },
  { id: 'solana', name: 'Solana', symbol: 'sol', image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png', current_price: 285, price_change_percentage_24h: 5.43 },
];

async function fetchCoins() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("API Blocked");
    
    const data = await response.json();
    coinsData = data;
    console.log("Ура! Данные скачаны из Интернета.");
    renderTable(coinsData);
    initCalculator(coinsData);
  } catch (error) {
    console.warn("Интернет не работает, включаем запасной вариант.");
    coinsData = BACKUP_DATA; 
    renderTable(coinsData);
    initCalculator(coinsData);
    if(coinsData.length > 0) loadChart(coinsData[0].id, coinsData[0].name);
  }
}

function renderTable(data) {
  const tbody = document.getElementById('cryptoTableBody');
  if (!tbody) {
      console.error("ОШИБКА: Не могу найти таблицу в HTML!");
      return;
  }
  tbody.innerHTML = ''; 

  data.forEach(coin => {
    const row = document.createElement('tr');
    const changeColor = coin.price_change_percentage_24h >= 0 ? 'green' : 'red';
    
    row.innerHTML = `
      <td style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
        <img src="${coin.image}" width="25"> <b>${coin.name}</b>
      </td>
      <td>${coin.current_price.toLocaleString('pl-PL')} PLN</td>
      <td style="color: ${changeColor}; font-weight:bold;">
        ${coin.price_change_percentage_24h.toFixed(2)}%
      </td>
    `;
    
    row.addEventListener('click', () => {
      loadChart(coin.id, coin.name);
    });

    tbody.appendChild(row);
  });
}

function initCalculator(data) {
  const input = document.getElementById('plnInput');
  const resultText = document.getElementById('calcResult');
  const btcCoin = data.find(c => c.symbol === 'btc');
  const safePrice = btcCoin ? btcCoin.current_price : 165000;

  if(input) {
      input.addEventListener('input', (e) => {
        const plnAmount = parseFloat(e.target.value);
        if (plnAmount > 0) {
          const btcAmount = (plnAmount / safePrice).toFixed(6);
          resultText.innerText = `To jest: ${btcAmount} BTC`;
        } else {
          resultText.innerText = "To jest: 0 BTC";
        }
      });
  }
}

async function loadChart(coinId, coinName) {
  const chartUrl = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=pln&days=7`;
  try {
    const response = await fetch(chartUrl);
    if (!response.ok) throw new Error("Chart API Blocked");
    const data = await response.json();
    const prices = data.prices.map(item => item[1]);
    const labels = data.prices.map(item => new Date(item[0]).toLocaleDateString());
    drawChart(labels, prices, coinName);
  } catch (error) {
    const fakePrices = [100, 105, 102, 110, 108, 115, 120];
    const fakeLabels = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'];
    drawChart(fakeLabels, fakePrices, coinName + " (Symulacja)");
  }
}

function drawChart(labels, prices, labelName) {
  const canvas = document.getElementById('cryptoChart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  if (myChart) myChart.destroy();

  myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: labelName,
        data: prices,
        borderColor: 'blue',
        tension: 0.4
      }]
    }
  });
}

// Запуск
fetchCoins();