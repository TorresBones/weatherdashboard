// $(document).ready(function () {
//  OpenWeather API
    var apiKey = 'dfeeac901eb9e6d9c301359f18f2b294';


    var cityEl = $('#city');
    var dateEl = $('#date');
    var weatherIconEl = $('#weather-icon');
    var temperatureEl = $('#temperature');
    var humidityEl = $('#humidity');
    var windEl = $('#win');
    var uvIndexEl =$('#uv-index');
    var cityListEl = $('div.cityList');

    var cityInput = $('#city-input');

    var pastCities = [];

    function compare(a, b) {
        var cityA = a.city.toUpperCase();
        var cityB = b.city.toUpperCase();

        var comparison = 0;
        if (cityA > cityB) {
            comparison = 1;
        } else if (cityA < cityB) {
            comparison = -1;
        }
        return comparison
    }

    //  Local Storage functions for past searched cities

    function loadCities() {
        var storedCities = JSON.parse(localStorage.getItem('pastCities'));
        if (storedCities) {
            pastCities = storedCities;
        }
    }

    function storedCities () {
        localStorage.setItem('pastCities', JSON.stringify(pastCities));
    }

    // Function to build URL for the API call
    
    function buildURLFromInputs (city) {
        if (city) {
            return `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
        }
    }

    function buildURLFromId(id) {
        return `https://api.openweathermap.org/data/2.5/weather?id=${id}&appid=${apiKey}`;
    }

    // Function to display the last 5 searched cities

    function displayCities(pastCities) {
        cityListEl.empty();
        pastCities.splice(5);
        var sortedCities = [...pastCities];
        sortedCities.sort(compare);
        sortedCities.forEach(function (location) {
            var cityDiv = $('<div>').addClass('col-12 city');
            var cityBtn = $('<button').addClass('btn btn-light city-btn').text(location.city);
            cityDiv.append(cityBtn);
            cityListEl.append(cityDiv);
        });
    }

    // Function to color UV Index based on the color scale from: https://www.epa.gov/sunsafety/uv-index-scale-0
    function setUVIndexColor(uvi) {
        if (uvi < 3) {
            return 'green';
        } else if (uvi >= 3 && uvi < 6) {
            return 'yellow';
        } else if (uvi >= 6 && uvi < 8) {
            return 'orange';
        } else if (uvi >= 8 && uvi < 11) {
            return 'red';
        } else return 'purple';
    }

    // Function to search for weather condition calling the OpenWeather API
    function searchWeather(queryURL) {

        // Create an AJAX call to retrieve weather data

        $.ajax({
            url: queryURL,
            method: 'GET',
        }).then(function (response) {

            // Store current city in the past cities
            var city = response.name;
            var id = response.id;
            // Remove duplicate name cities
            if (pastCities[0]) {
                pastCities = $.grep(pastCities, function (storedCities) {
                    return id !== storedCities.id;
                })
            }
            pastCities.unshift({ city, id });
            storedCities();
            displayCities(pastCities);

            // Display current weather in main DOM
            cityEl.text(response.name);
            var formatedDate = moment.unix(response.dt).format('L');
            dateEl.text(formatedDate);
            var weatherIcon = response.weather[0].icon;
            weatherIconEl.attr('src', `http://openweathermap.org/img/wn/${weatherIcon}.png`).attr('alt', response.weather[0].description);
            temperatureEl.html(((response.main.temp - 273.15) * 1.8 + 32).toFixed(1));
            humidityEl.text(reponse.main.humidity);
            windEl.text((response.wind.speed * 2.237).toFixed(1));

            // Call OpenWeather API with lat and lon to get UV index and the 5 day forecast

            var latitude = response.coord.latitude;
            var longitude = response.coord.longitude;
            var queryURLAll = 'https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${apiKey';

            $.ajax({
                url: queryURLAll,
                method: 'GET',
            }).then(function (response) {
                var uvIndex = response.current.uvi;
                var uvColor = setUVIndexColor(uvIndex);
                uvIndexEl.text(response.current.uvi);
                uvIndexEl.attr('style', 'background-color: ${uvColor}; color ${uvColor === "yellow" ? "black" : "white"}');
                var fiveDay = response.daily;

                for (var i = 0; i < 5; i++) {
                    var currentDay = fiveDay[1];
                    $('div.day-${i} .card.title').text(moment.unix(currentDay.dt).format('L'));
                    $('div.day-${i} .fiveDay-img').attr(
                        src, 'http://openweathermap.org/img/wn/${currentDay.weather[0].icon}.png').attr('alt', currentDay.weather[0].description);
                        $('div.day-${i} .fiveDay-temp').text(((currentDay.temp.day - 273.15) * 1.8 +32).toFixed(1));
                        $('div.day-${i} .fiveDay-humid').text(currentDay.humidity);
                }
            });
        
        });
    }

    // Function to display the last city searched in the search bar
    function displayLastCitySearched () {
        if (pastCities[0]) {
            var queryURL = buildURLFromId(pastCities[0].id);
            searchWeather(queryURL);
        } else {
            // If there is no past city searched load PA
            var queryURL = buildURLFromInputs("Pennsylvania");
            searchWeather(queryURL);
        }
    }

    $('#search-btn').on('click', function (event) {
        event.preventDefault();

        var city = cityInput.val().trim();
        city = encodeURIComponent(city);
        
        // city.replace('', '%20');

        // Clear the input field
        cityInput.val('');

        if (city) {
            var queryURL = buildURLFromInputs(city);
            searchWeather(queryURL);
        }
    });

    $(document).on('click', "button.city-btn", function (event) {
        var clickedCity = $(this).text();
        var foundCity = $.grep(pastCities, function (storedCities) {
            return clickedCity === storedCities.city;
        })

        var queryURL = buildURLFromId(foundCity[0].id)
        searchWeather(queryURL);
    });

    // Init for when page load

    loadCities();
    displayCities(pastCities);

    displayLastCitySearched();

// });