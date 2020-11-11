var byMinutes = [];
var data = [];

var svg, graph, gXAxis, gYAxis

function loadXMLDoc() {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      myFunction(this);
    }
  };
  xmlhttp.open("GET", `http://localhost/Blockwoche/${getUser()}.xml`, true);
  xmlhttp.send();
  d3.select("p").style("color", "green");

}

function myFunction(xml) {
  var element, i, xmlDoc, txt;
  xmlDoc = xml.responseXML;
  element = xmlDoc.getElementsByTagName("Record");

  // XML to Json
  var jsonarray = [];
  for (i = 13000; i < element.length; i++) {
    if (element[i].getAttribute("type") == "HKQuantityTypeIdentifierStepCount") {
      var json = {
        startDate: new Date(element[i].getAttribute("startDate")),
        endDate: new Date(element[i].getAttribute("endDate")),
        value: element[i].getAttribute("value")
      }
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

  var sum = 0;
  data.forEach(element => {
    sum = sum + element.stepPerMin;
  });
  document.getElementById("steps").innerText = sum

  loadGraph();

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
  document.getElementById("dates").value = url.searchParams.get("date");
  return url.searchParams.get("date");
}

function getUser() {
  var url_string = window.location.href
  var url = new URL(url_string);
  uuid=url.searchParams.get("user");
  document.getElementById("user").value = uuid
  if(uuid == ""){
    uuid = "8634f0f5-a77b-44c1-9273-c725c69bc842"
  }
  return uuid
}