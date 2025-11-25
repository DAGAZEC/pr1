import './style.css' 
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';


const map = L.map('map').setView([0, 0], 2);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);


async function getUsers() {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/users');
        if (!response.ok) throw new Error('Network error');
        return await response.json();
    } catch (error) {
        console.error(error);
        return [];
    }
}


async function renderMarkers() {
    const users = await getUsers();

    users.forEach(user => {
        const { lat, lng } = user.address.geo; 

        
        L.marker([lat, lng])
         .addTo(map)
         .bindPopup(`<b>${user.name}</b><br>${user.address.city}`);
    });
}

renderMarkers();