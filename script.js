// Firebase Config (Replace with your keys)
const firebaseConfig = {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Menu Data (Dynamic from Objects)
const menuData = {
    hotels: [
        {
            name: "Hotel Harsh",
            items: [
                { name: "Biryani", image: "images/hotel_harsh_biryani.jpg", fullPrice: 200, halfPrice: 150 },
                { name: "Paneer Butter Masala", image: "images/hotel_harsh_paneer.jpg", fullPrice: 180, halfPrice: 135 }
            ]
        },
        {
            name: "Red Dragon",
            items: [
                { name: "Chicken Manchurian", image: "images/red_dragon_chicken.jpg", fullPrice: 220, halfPrice: 165 }
            ]
        },
        // Add more as per prompt
    ],
    cafes: [
        {
            name: "Datta Bhel",
            items: [
                { name: "Pani Puri", image: "images/datta_bhel_panipuri.jpg", fullPrice: 50, halfPrice: 37.5 }
            ]
        },
        // Add more
    ]
};

// Load Menu Dynamically
function loadMenu() {
    const container = document.getElementById('hotels-cafes');
    [...menuData.hotels, ...menuData.cafes].forEach(place => {
        const card = document.createElement('div');
        card.className = 'hotel-cafe-card';
        card.innerHTML = `<h3>${place.name}</h3>`;
        place.items.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'item-card';
            itemDiv.innerHTML = `
                <img src="https://raw.githubusercontent.com/yourusername/yourrepo/main/${item.image}" alt="${item.name}">
                <p>${item.name}</p>
                <p>Full: ₹${item.fullPrice} | Half: ₹${item.halfPrice}</p>
            `;
            itemDiv.onclick = () => placeOrder(item);
            card.appendChild(itemDiv);
        });
        container.appendChild(card);
    });
}

// Place Order: Save to Firestore + Open WhatsApp
function placeOrder(item) {
    const order = {
        item: item.name,
        price: `Full ₹${item.fullPrice} / Half ₹${item.halfPrice}`,
        timestamp: new Date()
    };
    db.collection('orders').add(order).then(() => {
        const message = `Order: ${item.name} (${order.price}) - MAN-O-SALWA`;
        window.open(`https://wa.me/917057942815?text=${encodeURIComponent(message)}`, '_blank');
    });
}

// Google Maps for Distance
let map, userLocation;
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), { center: { lat: 20.5937, lng: 78.9629 }, zoom: 10 });
}

document.getElementById('calculate-distance').onclick = () => {
    const address = document.getElementById('location-input').value;
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK') {
            userLocation = results[0].geometry.location;
            const distance = google.maps.geometry.spherical.computeDistanceBetween(userLocation, new google.maps.LatLng(20.5937, 78.9629)) / 1000; // Assume village center
            const result = document.getElementById('distance-result');
            if (distance < 1) {
                result.textContent = `Distance: ${distance.toFixed(2)} KM - Free Delivery!`;
            } else {
                result.textContent = `Distance: ${distance.toFixed(2)} KM - Delivery Charge: ₹20`;
            }
        }
    });
};

// Admin Login
document.getElementById('admin-login-btn').onclick = () => {
    const email = prompt('Admin Email:');
    const password = prompt('Password:');
    auth.signInWithEmailAndPassword(email, password).then(() => {
        document.getElementById('admin-panel').style.display = 'block';
        loadOrders();
    }).catch(alert);
};

document.getElementById('logout-btn').onclick = () => {
    auth.signOut();
    document.getElementById('admin-panel').style.display = 'none';
};

// Load Orders for Admin
function loadOrders() {
    db.collection('orders').onSnapshot(snapshot => {
        const list = document.getElementById('orders-list');
        list.innerHTML = '';
        snapshot.forEach(doc => {
            const order = doc.data();
            list.innerHTML += `<p>${order.item} - ${order.price} - ${order.timestamp.toDate()}</p>`;
        });
    });
}

// Init
loadMenu();