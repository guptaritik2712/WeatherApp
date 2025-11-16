// api.openweathermap.org/data/2.5/weather?q={city name}&appid={API key}
// api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API key}
const weatherApi = {
    key: window.OPENWEATHER_API_KEY,
    baseUrl: "https://api.openweathermap.org/data/2.5/weather",
    aqiUrl: "https://api.openweathermap.org/data/2.5/air_pollution"
}

// Weather background mapping with your own images
const weatherBackgrounds = {
    'Clear': './images/clear.jpg',
    'Clouds': './images/cloud.jpg',
    'Haze': './images/cloud.jpg',
    'Rain': './images/rain.jpg',
    'Drizzle': './images/rain.jpg',
    'Thunderstorm': './images/thunder.jpg',
    'Snow': './images/snow.jpg',
    'Mist': './images/mist.jpg',
    'Fog': './images/fog.jpg',
    'Smoke': './images/cloud.jpg',
    'Dust': './images/cloud.jpg',
    'Sand': './images/cloud.jpg',
    'Ash': './images/cloud.jpg',
    'Squall': './images/thunder.jpg',
    'Tornado': './images/thunder.jpg'
};

// AQI categories and colors
const aqiCategories = {
    1: { label: 'Good', color: '#10b981' },
    2: { label: 'Fair', color: '#84cc16' },
    3: { label: 'Moderate', color: '#f59e0b' },
    4: { label: 'Poor', color: '#f97316' },
    5: { label: 'Very Poor', color: '#ef4444' }
};

// DOM Elements
const searchInputBox = document.getElementById('input-box');
const searchBtn = document.getElementById('search-btn');
const errorMessage = document.getElementById('error-message');
const loading = document.getElementById('loading');
const weatherBody = document.getElementById('weather-body');
const suggestionsList = document.getElementById('suggestions-list');

// Debounce timer for API calls
let debounceTimer;

// Event listener for input changes (autocomplete)
searchInputBox.addEventListener('input', (event) => {
    const value = event.target.value.trim();
    
    // Clear previous timer
    clearTimeout(debounceTimer);
    
    if (value.length >= 2) {
        // Wait 300ms after user stops typing before making API call
        debounceTimer = setTimeout(() => {
            fetchCitySuggestions(value);
        }, 300);
    } else {
        hideSuggestions();
    }
});

// Event listener for Enter key
searchInputBox.addEventListener('keypress', (event) => {
    if(event.key === 'Enter') {
        handleSearch();
        hideSuggestions();
    }
});

// Event listener for search button
searchBtn.addEventListener('click', () => {
    handleSearch();
    hideSuggestions();
});

// Close suggestions when clicking outside
document.addEventListener('click', (event) => {
    if (!searchInputBox.contains(event.target) && !suggestionsList.contains(event.target)) {
        hideSuggestions();
    }
});

// Handle search function
function handleSearch() {
    const city = searchInputBox.value.trim();
    if(city) {
        getweatherreport(city);
    } else {
        showError('Please enter a city name');
    }
}

// Fetch city suggestions from OpenWeatherMap Geocoding API
function fetchCitySuggestions(query) {
    fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=8&appid=${weatherApi.key}`)
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                displaySuggestions(data);
            } else {
                hideSuggestions();
            }
        })
        .catch(error => {
            console.error('Error fetching city suggestions:', error);
            hideSuggestions();
        });
}

// Display city suggestions
function displaySuggestions(cities) {
    suggestionsList.innerHTML = '';
    
    cities.forEach(city => {
        const suggestionItem = document.createElement('div');
        suggestionItem.className = 'suggestion-item';
        
        // Format: City, State (if available), Country
        let displayText = city.name;
        if (city.state) {
            displayText += `, ${city.state}`;
        }
        displayText += `, ${city.country}`;
        
        suggestionItem.textContent = displayText;
        suggestionItem.addEventListener('click', () => {
            searchInputBox.value = city.name;
            hideSuggestions();
            getweatherreport(city.name);
        });
        suggestionsList.appendChild(suggestionItem);
    });
    
    suggestionsList.classList.add('show');
}

// Hide suggestions
function hideSuggestions() {
    suggestionsList.classList.remove('show');
    suggestionsList.innerHTML = '';
}

// Show error message
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    loading.style.display = 'none';
    weatherBody.style.display = 'none';
}

// Show loading state
function showLoading() {
    loading.style.display = 'block';
    errorMessage.style.display = 'none';
    weatherBody.style.display = 'none';
}

// Hide loading state
function hideLoading() {
    loading.style.display = 'none';
}

// Get weather report by city name
function getweatherreport(city) {
    showLoading();
    fetch(`${weatherApi.baseUrl}?q=${city}&appid=${weatherApi.key}&units=metric`)
        .then(response => {
            if (!response.ok) {
                throw new Error('City not found');
            }
            return response.json();
        })
        .then(showWeatherReport)
        .catch(error => {
            console.error('Error:', error);
            showError('City not found. Please try again.');
        });
}

// Get weather report by coordinates
function getweatherreportByCoords(position) {
    showLoading();
    const coords = position.coords;
    fetch(`${weatherApi.baseUrl}?lat=${coords.latitude}&lon=${coords.longitude}&appid=${weatherApi.key}&units=metric`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Unable to fetch weather data');
            }
            return response.json();
        })
        .then(showWeatherReport)
        .catch(error => {
            console.error('Error:', error);
            showError('Unable to fetch weather data.');
        });
}


// Show weather report
function showWeatherReport(weather) {
    // console.log(weather);
    hideLoading();
    errorMessage.style.display = 'none';
    weatherBody.style.display = 'block';

    // Update location details
    document.getElementById('city').innerHTML = `${weather.name}, ${weather.sys.country}`;
    
    let todayDate = new Date();
    document.getElementById('date').innerHTML = dateManage(todayDate);

    // Update temperature
    document.getElementById('temp').innerHTML = `${Math.round(weather.main.temp)}&deg;C`;
    
    // Update weather icon
    const iconCode = weather.weather[0].icon;
    document.getElementById('weather-icon').innerHTML = `<img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="Weather icon">`;
    
    // Update weather description
    document.getElementById('weather').innerHTML = `${weather.weather[0].main}`;
    
    // Update min/max temperature
    document.getElementById('min-max').innerHTML = `${Math.floor(weather.main.temp_min)}&deg;C (min) / ${Math.ceil(weather.main.temp_max)}&deg;C (max)`;
    
    // Update feels like temperature
    document.getElementById('feels-like').innerHTML = `Feels like: ${Math.round(weather.main.feels_like)}&deg;C`;
    
    // Update additional weather details
    document.getElementById('humidity').innerHTML = `${weather.main.humidity}%`;
    document.getElementById('wind-speed').innerHTML = `${weather.wind.speed} m/s`;
    document.getElementById('pressure').innerHTML = `${weather.main.pressure} hPa`;
    
    // Update visibility (convert from meters to kilometers)
    const visibilityKm = weather.visibility ? (weather.visibility / 1000).toFixed(1) : 'N/A';
    document.getElementById('visibility').innerHTML = `${visibilityKm} km`;

    // Fetch and display AQI
    fetchAQI(weather.coord.lat, weather.coord.lon);

    // Update background based on weather
    const weatherType = weather.weather[0].main;
    const backgroundImage = weatherBackgrounds[weatherType] || weatherBackgrounds['Clear'];
    document.body.style.backgroundImage = `url('${backgroundImage}')`;
}


// Fetch Air Quality Index
function fetchAQI(lat, lon) {
    fetch(`${weatherApi.aqiUrl}?lat=${lat}&lon=${lon}&appid=${weatherApi.key}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('AQI data not available');
            }
            return response.json();
        })
        .then(data => {
            displayAQI(data);
        })
        .catch(error => {
            console.error('Error fetching AQI:', error);
            document.getElementById('aqi-value').innerHTML = 'N/A';
        });
}

// Display AQI data
function displayAQI(aqiData) {
    const aqi = aqiData.list[0].main.aqi;
    const components = aqiData.list[0].components;
    const category = aqiCategories[aqi];
    const aqiBadge = document.getElementById('aqi-badge');
    const aqiNumber = document.getElementById('aqi-number');
    const aqiValue = document.getElementById('aqi-value');
    const aqiDescription = document.getElementById('aqi-description');
    
    // Calculate US AQI from PM2.5 (most common pollutant)
    const pm25 = components.pm2_5;
    let usAQI = calculateUSAQI(pm25);
    
    // Update AQI displays
    aqiNumber.innerHTML = usAQI;
    aqiValue.innerHTML = category.label;
    
    // Set class for color styling
    aqiBadge.className = 'aqi-badge';
    switch(aqi) {
        case 1: aqiBadge.classList.add('good'); break;
        case 2: aqiBadge.classList.add('fair'); break;
        case 3: aqiBadge.classList.add('moderate'); break;
        case 4: aqiBadge.classList.add('poor'); break;
        case 5: aqiBadge.classList.add('very-poor'); break;
    }
    
    // Add description based on category
    const descriptions = {
        1: '😊 Perfect air quality for outdoor activities',
        2: '🙂 Air quality is acceptable',
        3: '😐 Sensitive people should reduce outdoor exposure',
        4: '😷 Everyone should reduce outdoor activities',
        5: '⚠️ Health alert! Avoid outdoor activities'
    };
    
    aqiDescription.innerHTML = descriptions[aqi];
}

// Calculate US AQI from PM2.5
function calculateUSAQI(pm25) {
    // US AQI breakpoints for PM2.5
    const breakpoints = [
        { cLow: 0, cHigh: 12, iLow: 0, iHigh: 50 },
        { cLow: 12.1, cHigh: 35.4, iLow: 51, iHigh: 100 },
        { cLow: 35.5, cHigh: 55.4, iLow: 101, iHigh: 150 },
        { cLow: 55.5, cHigh: 150.4, iLow: 151, iHigh: 200 },
        { cLow: 150.5, cHigh: 250.4, iLow: 201, iHigh: 300 },
        { cLow: 250.5, cHigh: 500, iLow: 301, iHigh: 500 }
    ];
    
    for (let bp of breakpoints) {
        if (pm25 >= bp.cLow && pm25 <= bp.cHigh) {
            const aqi = ((bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow)) * (pm25 - bp.cLow) + bp.iLow;
            return Math.round(aqi);
        }
    }
    
    return pm25 > 500 ? 500 : 0;
}


// Date manage
function dateManage(dateArgs) {
    let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    let year = dateArgs.getFullYear();
    let month = months[dateArgs.getMonth()];
    let date = dateArgs.getDate();
    let day = days[dateArgs.getDay()];
    return `${date} ${month} (${day}), ${year}`;
}

// Geolocation callbacks
const successCallback = (position) => {
    getweatherreportByCoords(position);
}

const errorCallback = (error) => {
    console.error('Geolocation error:', error);
    // Load Panipat weather if geolocation fails
    getweatherreport('Panipat');
}

// Get weather for user's current location, fallback to Panipat
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
} else {
    // If geolocation not supported, load Panipat
    getweatherreport('Panipat');
}