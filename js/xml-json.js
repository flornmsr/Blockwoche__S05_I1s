var byMinutes = [];
var data = [];

var svg, graph, gXAxis, gYAxis

var allDates = false;

var stepSum = 0;

var availableUsers = [
  "0f4e5e49-bfaa-4394-843d-9bb3cf6ed480",
  "5417a0f4-e6d2-4480-9d87-9edb58134675",
  "8634f0f5-a77b-44c1-9273-c725c69bc842",
  "b7291015-75ec-4c43-9db6-2cde9df73001",
  "db27309d-c398-49a2-ad3e-9695921da3a3",
  "ea5d35ca-7afa-4f07-b91d-f3dd0c73dcd1"
]



function loadXMLDoc() {
  userSelect = document.getElementById('user');
  availableUsers.forEach((userUuid, index) => {
    userSelect.options[userSelect.options.length] = new Option(`User ${index+1}`, userUuid);
  })
  daySelect = document.getElementById('dates');
  relevantDates.forEach((date, index) => {
    daySelect.options[daySelect.options.length] = new Option(date.toLocaleDateString(), date);
  })


  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      myFunction(this);
    }
  };
  xmlhttp.open("GET", `http://localhost/Blockwoche/xml/${getUser()}.xml`, true);
  xmlhttp.send();

}

function myFunction(xml) {
  var element, i, xmlDoc, txt;
  xmlDoc = xml.responseXML;
  element = xmlDoc.getElementsByTagName("Record")

  // XML to Json
  var jsonarray = [];
  for (i = 0; i < element.length; i++) {
    if (element[i].getElementsByTagName("unit")[0].innerHTML == "count") {
      var json = {
        startDate: new Date(element[i].getElementsByTagName("startDate")[0].innerHTML),
        endDate: new Date(element[i].getElementsByTagName("endDate")[0].innerHTML),
        value: element[i].getElementsByTagName("value")[0].innerHTML
      }
      json.startDate = new Date(json.startDate.getTime() + 7200000);
      json.endDate = new Date(json.endDate.getTime() + 7200000);

      jsonarray.push(json)
    }

  }


  //Loop over all entries, create entry for each minute
  for (i = 1; i <= jsonarray.length; i++) {
    var start = Math.floor(jsonarray[i - 1].startDate.setSeconds(0) / 1000);
    var end = Math.floor(jsonarray[i - 1].endDate.setSeconds(0) / 1000)
    var time = Math.floor((end - start) / 60);
    var stepsPerMin = jsonarray[i - 1].value / time;
    for (j = 0; j < time; j++) {
      if (start + (60 * j) <= end) {
        byMinutes.push({ "date": new Date((start + 60 * j) * 1000).toISOString(), "stepPerMin": stepsPerMin })
      }
    }
    if (i < jsonarray.length) {
      var nextStart = Math.floor(jsonarray[i].startDate.setSeconds(0) / 1000);
      if (nextStart - end >= 60) {
        var diff = (nextStart - end) / 60
        for (k = 0; k < diff; k++) {
          byMinutes.push({ "date": new Date((end + 60 * k) * 1000).toISOString(), "stepPerMin": 0 })
        }
      }
    }
  }

  //Filter
  var givenDate = new Date(getDate());
  data = byMinutes.filter(val => {
    var date = new Date(val.date)

    if (givenDate.getDate() == date.getDate()
      && givenDate.getMonth() == date.getMonth()
      && givenDate.getFullYear() == date.getFullYear()
      && date.getHours() >= 11 && date.getHours() < 13) {
      return true
    }
    return false
  })

  sumSteps();

  loadGraph();

}

function getFilteredData(givenDate) {
  var filterdData = byMinutes.filter(val => {
    var date = new Date(val.date)

    if (givenDate.getDate() == date.getDate()
      && givenDate.getMonth() == date.getMonth()
      && givenDate.getFullYear() == date.getFullYear()
      && date.getHours() >= 11 && date.getHours() < 13) {
      return true
    }
    return false
  });
  return filterdData;
}

function sumSteps() {
  data.forEach(element => {
    stepSum = stepSum + element.stepPerMin;
  });
  document.getElementById("steps").innerText = Math.floor(stepSum);
}

function load() {
  date = document.getElementById("dates").value;
  user = document.getElementById("user").value;
  var url = new URL('http://localhost/Blockwoche');
  var search_params = url.searchParams;

  // add "topic" parameter
  search_params.set('date', date);
  search_params.set('user', user);

  url.search = search_params.toString();

  window.location.replace(url.search)
}

function getDate() {
  var url_string = window.location.href
  var url = new URL(url_string);
  date = url.searchParams.get("date");
  document.getElementById("dates").value = date
  if (date == "all") {
    allDates = true;
    return "2020-09-18";
  }
  return url.searchParams.get("date");
}

function getUser() {
  var url_string = window.location.href
  var url = new URL(url_string);
  uuid = url.searchParams.get("user");
  document.getElementById("user").value = uuid
  if (uuid == "") {
    uuid = "8634f0f5-a77b-44c1-9273-c725c69bc842"
  }
  return uuid
}