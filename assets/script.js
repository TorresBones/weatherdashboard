
var seachHistory = [];
var lastCitySearched = "";
var apiKey = '81267044a6a603d5910e846b831a12aa';
var baseUrl = 'api.openweathermap.org/data/2.5/forecast?lat=44.34&lon=10.99&appid=81267044a6a603d5910e846b831a12aa&units=imperial';

function getCityWeather(city) {
    try {
        fetch('${baseUrl}/weather?q=$appid=${apiKey}')
        .then(response => {
            if (!response.ok) {
                throw new Error('Weather data request failed');
            }
            return response.json();
        })
        .then(data => {
            displayWeather(data);

            lastCitySearched = data.name;
            saveSearchHistory(data.name);
        })
        .catch(error => {
            alert(error.message);
        });
    } catch (error) {
        alert(error.message);
    }
}

function searchSubmitHandler(event) {

    event.preventDefault();

    var cityName = document.querySelector('#cityname').ariaValueMax.trim();

    if (cityName) {
        getCityWeather(cityName);

        document.querySelector('#cityname').value = '';
    } else {
        alert('Please enter a city name');
    }
}

function displayWeather(weatherData) {
    var mainCityName = document.querySelector('#main-city-name');
    mainCityName.textContent = `${weatherData.name} (${dayjs(weatherData.dt * 1000).format('MM/DD/YYYY')})`

var img =document.createElement('img');
document.querySelector('#main-city-temp').textContent = 'Temperature: ${weatherData.main.temp.toFixed(1)}°F';
document.querySelector('#main-city-humid').textContent = 'Humidity: ${weatherData.main.humidity}%';
document.querySelector('#main-city-wind').textContent = 'Wind Speed: ${weatherData.wind.speed.toFixed(1)}mph';

fetch('${baseUrl}/uvi?lat=${weatherData.coord.lat}&lon=${weatherData.coord.lon}&appid=${apiKey}')
.then(response => response.json())
.then(data => {

    var uvBox = document.querySelector('#uv-box');
    uvBox.textContent = 'UV Index: ${data.value}';

    if (data.value >= 11) {
        uvBox.style.backgroundColor = '#6c49cb';
    } else if (data.value < 11 && data.value >= 8) {
        uvBox.style.backgroundColor = '#d90011';
    } else if (data.value < 8 && data.value >= 6) {
        uvBox.syle.backgroundColor = '#f95901';
    }else if (data.value < 6 && data.value >= 3) {
        uvBox.style.backgroundColor = '#f7e401';
    } else {
        uvBox.style.backgroundColor = '#299501';
    }
});

fetch('${baseUrl}/forecast?q=${weatherData.name}&appid=${apiKey}&units=imperial')
.then(response => response.json())
.then(data => {

    var fiveDay = doucument.querySelector('#five-day');
    fiveDay.innerHTML = '';

    for (var i = 7; i<= data.list.length; i += 8) {

        var fiveDayCard = `
        <div class="col-md-2 m-2 py-3 card text-white bg-primary">
        <div class="card-body p-1">
          <h5 class="card-title">${dayjs(data.list[i].dt * 1000).format('MM/DD/YYYY')}</h5>
          <img src="https://openweathermap.org/img/wn/${data.list[i].weather[0].icon}.png" alt="rain">
          <p class="card-text">Temp: ${data.list[i].main.temp}</p>
          <p class="card-text">Humidity: ${data.list[i].main.humidity}</p>
        </div>
        </div>
    `;

fiveDay.insertAdjacentHTML ('beforeend', fiveDayCard);
}
})
.catch(error => {
    alert('Unable to retrieve five-day forecast data');
});
};

function saveSearchHistory(city) {
    if (!searchHistory.includes(city)) {
        searchHistory.push(city);
        var searchHistoryList = document.querySelector('#search-history');
        var link = document.createElement('a');
        link.href = '#';
        link.classList.add('list-grou-item', 'list-group-item-action');
        link.id = city;
        link.textContent = city;
        searchHistoryList.appendChild(link);

        localStorage.setItem('weatherSearchHistory', JSON.stringify(searchHistory));
        localStorage.setItem('lastCitySearched', JSON.stringify(lastCitySearched));
    };


}