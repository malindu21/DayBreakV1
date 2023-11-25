const cityTextBox = document.getElementById("city");
const citySearchResults = document.getElementById("search-results");
let addressList = [];
let selectedAddress = {};
let distance = 0;
let packageName = "";
let pachageCat = "";
let selectedDate = "";

let maxNoOfTravellers = 0;
let minNoOfTravellers = 0;
let noOfTravellers = 0;
let travellerDetails = [];

let isTravellerDetailsSubmitted = false;

getAllPackages();

function getAllPackages() {
  fetch("js/packages.json")
    .then((response) => response.json())
    .then((data) => {
      const activityList = document.getElementById("activity-list");
      document.getElementById("package-title").innerHTML = data[0].title;
      document.getElementById("main-bg").style.background =
        "url(" + data[0].backgroundImageUrls[0] + ") no-repeat center center";
      document.getElementById("main-bg").style.backgroundSize = "cover";
      activityList.innerHTML = "";
      data[0].activities.map((e) => {
        let element = `<div class="quick-info beverage-onboard">
      <i class="${e.iconClass}"></i>
      <span class="text ms-2">${e.title}</span>
    </div>`;

        activityList.innerHTML += element;
      });
    });
}

// ============= TICKET TYPE & NO OF TRAVELLERS =================
const travellerDetailsBtn = document.getElementById("traveller-details-btn");
const noOfTravellersEle = document.getElementById("no-of-travellers");
const ticketTypeEle = document.getElementById("ticket_type");

noOfTravellersEle.addEventListener("input", function (e) {
  if (
    e.target.value < minNoOfTravellers ||
    e.target.value > maxNoOfTravellers
  ) {
    noOfTravellersEle.value = "";
  } else {
    travellerDetailsBtn.removeAttribute("disabled");
    noOfTravellers = Number(e.target.value);
    loadTravellersElements();
  }
});

noOfTravellersEle.setAttribute("readonly", "true");
noOfTravellersEle.setAttribute(
  "placeholder",
  "Please Select Ticket type first"
);
ticketTypeEle.addEventListener("change", function (e) {
  noOfTravellersEle.removeAttribute("readonly");
  if (e.target.value == "suv") {
    setMinMaxTravellers(1, 4);
  } else if (e.target.value == "van") {
    setMinMaxTravellers(1, 7);
  } else {
    noOfTravellersEle.setAttribute("readonly", "true");
  }
  document.getElementById("max-passengers").innerHTML = maxNoOfTravellers;
});

function setMinMaxTravellers(minTravellers, maxTravellers) {
  minNoOfTravellers = minTravellers;
  maxNoOfTravellers = maxTravellers;
  noOfTravellersEle.setAttribute(
    "placeholder",
    `Maximum ${maxTravellers} Travellers`
  );
}

// ============= TRAVELLERS DETAILS MODAL =================

travellerDetailsBtn.addEventListener("click", function (event) {
  $("#travellerModal").modal("show");
});

function loadTravellersElements() {
  document.getElementById("travellers-list").innerHTML = "";
  for (let i = 1; i <= noOfTravellers; i++) {
    document.getElementById("travellers-list").innerHTML += `
    <div class="col-lg-6">
    <h6>Traveller ${i}</h6>
    <div class="input-group mb-3">
      <span class="input-group-text" id="basic-addon1"><i class="fas fa-signature"></i></span>
      <input type="text" class="form-control" name="username${i}" placeholder="Full Name" aria-label="fullName"
        aria-describedby="basic-addon1">
    </div>
    <div class="input-group mb-3">
      <span class="input-group-text" id="basic-addon2"><i class="fas fa-birthday-cake"></i></span>
      <input type="number" class="form-control" name="age${i}" placeholder="Age" aria-label="age"
        aria-describedby="basic-addon2">
    </div>
  </div>`;
  }
}

document.getElementById('travellers-form').addEventListener('submit', function(event) {
  event.preventDefault();
  travellerDetails = [];
  isTravellerDetailsSubmitted = true;
  let elementList = event.target;
  for (let index = 1; index < elementList.length-2; index++) {
    travellerDetails.push({name: elementList[index].name, value: elementList[index].value})
  }
});



// ============= SEARCH LOCATIONS =================
let sCoords = {
  latitude: selectedAddress.lat,
  longitude: selectedAddress.lon,
};

let dCoords = {
  latitude: -37.840935,
  longitude: 144.946457,
};

function searchLocations(text) {
  fetch(
    "https://api.geoapify.com/v1/geocode/autocomplete?text=" +
      text +
      "&format=json&apiKey=e510a82d6fcd4b4882e8399e5675d2bb"
  )
    .then((response) => response.json())
    .then((result) => {
      addressList = [];
      citySearchResults.innerHTML = "";
      if (result.results != undefined || result.results != null) {
        result.results.forEach((element) => {
          const address = {
            lat: element.lat,
            lon: element.lon,
            formatted: element.formatted,
            city: element.city,
            country: element.country,
          };
          loadCityResult(address);
          addressList.push(address);
        });
        // console.log(addressList);
      }
    })
    .catch((error) => console.error("error", error));
}

cityTextBox.addEventListener("input", function () {
  if (cityTextBox.value != "") {
    searchLocations(cityTextBox.value);
  }
});
cityTextBox.addEventListener("search", function () {
  if (cityTextBox.value == "") {
    citySearchResults.classList.add("d-none");
  }
});

function loadCityResult(address) {
  const li = document.createElement("li");
  const citySpan = document.createElement("splan");
  const formattedSpan = document.createElement("span");

  citySearchResults.classList.remove("d-none");
  citySpan.classList.add("fw-bold");
  citySpan.classList.add("me-2");
  li.classList.add("list-group-item");
  li.classList.add("user-select");

  citySpan.innerText =
    address.city == undefined ? address.country : address.city;
  formattedSpan.innerText = address.formatted;

  li.setAttribute("data-address", JSON.stringify(address));
  li.addEventListener("click", function (e) {
    e.stopPropagation();
    selectedAddress = JSON.parse(e.currentTarget.dataset.address);
    sCoords = {
      latitude: selectedAddress.lat,
      longitude: selectedAddress.lon,
    };
    distance = calcDistance(sCoords, dCoords);
    //console.log(distance, "Km");
    cityTextBox.value = selectedAddress.formatted;
    citySearchResults.innerHTML = "";
    citySearchResults.classList.add("d-none");
    if (distance > 20) {
      showDistanceExceedPopup();
    } else {
      pachageCat = distance > 10 ? "plus" : "general";
      calculateValue(distance > 10);
    }
  });

  li.appendChild(citySpan);
  li.appendChild(formattedSpan);
  citySearchResults.appendChild(li);
}

// Convert from degrees to radians
function degreesToRadians(degrees) {
  var radians = (degrees * Math.PI) / 180;
  return radians;
}

// Function takes two objects, that contain coordinates to a starting and destination location.
function calcDistance(startCoords, destCoords) {
  let startingLat = degreesToRadians(startCoords.latitude);
  let startingLong = degreesToRadians(startCoords.longitude);
  let destinationLat = degreesToRadians(destCoords.latitude);
  let destinationLong = degreesToRadians(destCoords.longitude);

  // Radius of the Earth in kilometers
  let radius = 6371;

  // Haversine equation
  let distanceInKilometers =
    Math.acos(
      Math.sin(startingLat) * Math.sin(destinationLat) +
        Math.cos(startingLat) *
          Math.cos(destinationLat) *
          Math.cos(startingLong - destinationLong)
    ) * radius;
  return distanceInKilometers;
}

//enable custom datepicker

flatpickr("input[type=datetime-local]", {
  minDate: "today",
});

function validateCheckout() {
  selectedDate = document.getElementById("schedule-date").value;
  if (ticketTypeEle.value === "") {
    showToast("Please select your ticket type to continue.");
  } else if (noOfTravellersEle.value === "") {
    showToast("Please enter number of travellers to continue.");
  } else if (!isTravellerDetailsSubmitted) {
    showToast("Please submit all traveller's details to continue.");
  } else if (pachageCat === "") {
    showToast("Please select your address to continue.");
  } else if (selectedDate === "") {
    showToast("Please select your tour date to continue.");
  } else {
    showPopupWithDelay();
  }
}

function showPopupWithDelay() {
  myPopup.classList.add("show");
  setTimeout(myFunction, 2000);
}

myButton.addEventListener("click", validateCheckout);

closePopup.addEventListener("click", function () {
  myPopup.classList.remove("show");
});
window.addEventListener("click", function (event) {
  if (event.target == myPopup) {
    myPopup.classList.remove("show");
  }
});

function calculateValue(status) {
  // Get the element by its ID
  var priceElement = document.querySelectorAll("#price");

  // Extract the text content and remove the dollar sign
  var priceText = 140;

  // Parse the string to a floating-point number
  var priceValue = parseFloat(priceText);

  // Perform calculations (e.g., double the value)
  var result = 0;
  document.getElementById("price-breakdown").innerHTML =
    "$" + priceValue.toFixed(2);
  if (status == true) {
    result = priceValue + 50;
    document.getElementById("pickup-charge").innerHTML = "$50";
    document.getElementById("distance-msg").innerHTML =
      "(Outside of melbourne CBD, 10Km radius)";
  } else {
    result = priceValue;
    document.getElementById("pickup-charge").innerHTML = "$0";
    document.getElementById("distance-msg").innerHTML =
      "(With in Melbourne CBD 10km radius)";
  }
  // Display the result (you can modify this based on your requirements)
  priceElement.forEach((element) => {
    element.innerHTML = "$" + result.toFixed(2);
  });
}

function addTicketWidget(ref) {
  var widgetContainer = document.getElementById("widget-container");
  var scriptElement = document.createElement("script");
  var url =
    "https://www.tickettailor.com/all-tickets/malindu/?ref=" +
    selectedDate +
    "&srch=" +
    ref;

  scriptElement.src = "https://cdn.tickettailor.com/js/widgets/min/widget.js";
  scriptElement.setAttribute("data-url", url);
  scriptElement.setAttribute("data-type", "inline");
  scriptElement.setAttribute("data-inline-minimal", "false");
  scriptElement.setAttribute("data-inline-show-logo", "true");
  scriptElement.setAttribute("data-inline-bg-fill", "true");
  scriptElement.setAttribute(
    "data-inline-inherit-ref-from-url-param",
    "special"
  );
  scriptElement.setAttribute("data-inline-ref", "website_widget");

  widgetContainer.appendChild(scriptElement);
}

// Call the function to add the widget when the page loads
// window.onload = addTicketWidget;

document
  .getElementById("schedule-date")
  .addEventListener("change", function (e) {
    debugger;
    // Get the selected date
    selectedDate = e.target.value;
    console.log(selectedDate);
  });

function myFunction() {
  console.log("Function executed after 2 seconds");
  addTicketWidget(pachageCat);

  // Add your code here
  document.getElementById("loader").style.display = "none";
}

function showDistanceExceedPopup() {
  showToast(
    "Pick-up location entered is outside our standard radius. Please contact booking team for support."
  );

  var cityTxtField = document.getElementById("city");

  cityTxtField.value = "";
}

function showToast(message) {
  const toastLiveExample = document.getElementById("liveToast");
  const toastBody = document.getElementById("toast-body");
  toastBody.innerHTML = message;
  const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample);
  toastBootstrap.show();
}
