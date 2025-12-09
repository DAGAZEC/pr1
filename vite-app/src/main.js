import './style.css'
import Chart from 'chart.js/auto';

const API_URL = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=pln&order=market_cap_desc&per_page=20&page=1&sparkline=false';

let coinsData = [];
let lineChart = null;
let doughnutChart = null;
let isAscending = false;

// ЗАПАСНЫЕ ДАННЫЕ (Если API CoinGecko заблокирован)
const BACKUP_DATA = [
    { id: 'bitcoin', name: 'Bitcoin', symbol: 'btc', image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png', current_price: 168000, price_change_percentage_24h: 1.2, market_cap: 3200000000000 },
    { id: 'ethereum', name: 'Ethereum', symbol: 'eth', image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png', current_price: 9200, price_change_percentage_24h: -0.5, market_cap: 1100000000000 },
    { id: 'tether', name: 'Tether', symbol: 'usdt', image: 'https://assets.coingecko.com/coins/images/325/large/Tether.png', current_price: 4.01, price_change_percentage_24h: 0.0, market_cap: 400000000000 },
    { id: 'binancecoin', name: 'BNB', symbol: 'bnb', image: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png', current_price: 950, price_change_percentage_24h: 2.1, market_cap: 350000000000 },
    { id: 'solana', name: 'Solana', symbol: 'sol', image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png', current_price: 280, price_change_percentage_24h: 5.4, market_cap: 200000000000 },
    { id: 'ripple', name: 'XRP', symbol: 'xrp', image: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png', current_price: 2.10, price_change_percentage_24h: -1.1, market_cap: 100000000000 },
];

async function fetchCoins() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("API Blocked");
    coinsData = await response.json();
    runApp(coinsData);
  } catch (error) {
    console.warn("API недоступен, используем Backup данные.");
    coinsData = BACKUP_DATA;
    runApp(coinsData);
  }
}

function runApp(data) {
    renderTable(data);
    initCalculator(data);
    initDoughnutChart(data);
    if(data.length > 0) loadLineChart(data[0].id, data[0].name, data[0].current_price);
}

// --- 1. БУБЛИК (DOUGHNUT CHART) ---
function initDoughnutChart(data) {
    const canvas = document.getElementById('doughnutChart');
    if (!canvas) return; // Проверка на существование

    const ctx = canvas.getContext('2d');
    if (doughnutChart) doughnutChart.destroy();

    const top5 = data.slice(0, 5);
    const labels = top5.map(c => c.symbol.toUpperCase());
    const marketCaps = top5.map(c => c.market_cap);
    const chartColors = ['#f2a900', '#3c3c3d', '#00c087', '#3b82f6', '#e74c3c'];

    doughnutChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: marketCaps,
                backgroundColor: chartColors,
                borderWidth: 0,
                hoverOffset: 15
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: { boxWidth: 12, usePointStyle: true, font: { family: 'Inter', size: 11 } }
                }
            },
            cutout: '75%'
        }
    });
}


// --- 2. ЛИНЕЙНЫЙ ГРАФИК (С Датами и Ценами) ---
function loadLineChart(coinId, coinName, currentPrice) {
  const canvas = document.getElementById('cryptoChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  if (lineChart) lineChart.destroy();

  // Генерируем последние 7 дней (настоящие даты)
  const labels = [];
  for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      // Формат: 12.05 (День.Месяц)
      labels.push(d.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' }));
  }

  // Генерируем цены вокруг текущей цены
  let price = currentPrice;
  const dataPoints = labels.map(() => {
     price = price * (1 + (Math.random() * 0.1 - 0.05)); // +/- 5%
     return price;
  });

  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
  gradient.addColorStop(1, 'rgba(59, 130, 246, 0.0)');

  lineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: coinName,
        data: dataPoints,
        borderColor: '#3b82f6',
        backgroundColor: gradient,
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointRadius: 3,            // Маленькие точки
        pointHoverRadius: 6,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#3b82f6'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
          padding: { left: 10, right: 20, top: 20, bottom: 10 } // Отступы, чтобы текст не резался
      },
      plugins: { 
          legend: { display: false },
          tooltip: {
              callbacks: {
                  label: function(context) {
                      return context.parsed.y.toLocaleString('pl-PL') + ' PLN';
                  }
              }
          }
      },
      scales: {
        x: { 
            grid: { display: false }, 
            ticks: { 
                font: { family: 'Inter', size: 11 },
                color: '#6b7280',
                maxRotation: 0, // Чтобы даты не крутились
                autoSkip: true
            } 
        },
        y: { 
            border: { display: false }, 
            grid: { color: '#f3f4f6' }, 
            ticks: { 
                font: { family: 'Inter', size: 10 },
                color: '#9ca3af',
                callback: function(value) {
                    // Форматируем ось Y (например, 15000 PLN)
                    return value.toLocaleString('pl-PL'); 
                }
            } 
        }
      }
    }
  });
}

// --- 3. ТАБЛИЦА ---
function renderTable(data) {
  const tbody = document.getElementById('cryptoTableBody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  data.forEach((coin, index) => {
    const row = document.createElement('tr');
    const sign = coin.price_change_percentage_24h > 0 ? '+' : '';
    const changeClass = coin.price_change_percentage_24h >= 0 ? 'green' : 'red';
    
    row.innerHTML = `
      <td style="color: #9ca3af;">${index + 1}</td>
      <td>
        <div class="coin-flex">
          <img src="${coin.image}" alt="${coin.name}">
          <div><div style="font-weight: 600;">${coin.name}</div><div class="symbol">${coin.symbol.toUpperCase()}</div></div>
        </div>
      </td>
      <td class="price">${coin.current_price.toLocaleString('pl-PL')} PLN</td>
      <td class="${changeClass}" style="font-weight: 500;">${sign}${coin.price_change_percentage_24h.toFixed(2)}%</td>
      <td style="color: #6b7280;">${(coin.market_cap / 1000000).toFixed(0)} M</td>
    `;
    
    // Передаем текущую цену в график, чтобы он рисовался красиво
    row.addEventListener('click', () => loadLineChart(coin.id, coin.name, coin.current_price));
    
    tbody.appendChild(row);
  });
}

// --- 4. СОРТИРОВКА (Исправленная) ---
const sortBtn = document.getElementById('sortPriceBtn');
if (sortBtn) {
    sortBtn.addEventListener('click', () => {
      isAscending = !isAscending;
      
      coinsData.sort((a, b) => {
        return isAscending 
            ? a.current_price - b.current_price 
            : b.current_price - a.current_price;
      });
      
      renderTable(coinsData);
      
      // Обновляем стрелочку
      const icon = document.querySelector('.sort-icon');
      if(icon) icon.innerText = isAscending ? "▲" : "▼";
    });
}

// --- 5. КАЛЬКУЛЯТОР ---
function initCalculator(data) {
  const input = document.getElementById('plnInput');
  const resultText = document.getElementById('calcResult');
  
  // Ищем BTC
  const btc = data.find(c => c.symbol === 'btc');
  const btcPrice = btc ? btc.current_price : 1;
  
  if (input && resultText) {
      input.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        resultText.innerText = val > 0 ? (val / btcPrice).toFixed(6) + " BTC" : "0.000000 BTC";
      });
  }
}

// Старт
fetchCoins();