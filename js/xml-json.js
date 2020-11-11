var byMinutes = [];
var data = [];

var svg, graph, gXAxis, gYAxis, walkPhase, restPhase, sum, restPhase2, restPhase3 = 0

var allDates = false;

var stepSum = 0;

var availableUsers = [
  "5417a0f4-e6d2-4480-9d87-9edb58134675",
  "8634f0f5-a77b-44c1-9273-c725c69bc842"
]



function loadXMLDoc() {
  userSelect = document.getElementById('user');
  availableUsers.forEach((userUuid, index) => {
    userSelect.options[userSelect.options.length] = new Option(`User ${index + 1}`, userUuid);
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
      if (getUser() == "8634f0f5-a77b-44c1-9273-c725c69bc842") {
        json.startDate = new Date(json.startDate.getTime() + 7200000);
        json.endDate = new Date(json.endDate.getTime() + 7200000);
      }


      jsonarray.push(json)
    }

  }

  console.log(jsonarray);



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

  console.log(byMinutes);

  //Filter
  var givenDate = new Date(getDate());
  data = getFilteredData(givenDate);
  console.log(data);

  sumSteps();

  detectphases();

  detectTyp();

  detectPunctuality()

  loadGraph();

}

function getFilteredData(givenDate) {
  var filterdData = byMinutes.filter(val => {
    var date = new Date(val.date)

    if (givenDate.getDate() == date.getDate()
      && givenDate.getMonth() == date.getMonth()
      && givenDate.getFullYear() == date.getFullYear()
      && ((date.getHours() >= 11 && date.getMinutes() >= 30) || date.getHours() >= 12) && date.getHours() < 13) {
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

function detectphases() {
  restPhase = 0;
  walkPhase = 0;
  var j = 0; //Length of this intervall walkphase
  var n = 0; //Length of this intervall restPhase
  var g = 0; //Complet length of walkPhase
  for (let i = 0; i < data.length; i++) {
    if (data[i].stepPerMin > 15) {
      while (i < data.length && data[i].stepPerMin > 15) {
        i++;
        j++; //length walkPhase
        g++;
      }
      if (j >= 2) { //only when longer than 2 minutes
        walkPhase++;
        n = 0; //when shorter tahn 2 minutes the length of restPhase will continue}
      } else if (restPhase > 0) {
        restPhase--;
      }
    }
    else if (data[i].stepPerMin <= 15) {
      while (i < data.length && data[i].stepPerMin <= 15) {
        i++;
        n++; //length restPhase
      }
      if (n >= 2) { //only when longer than 2 minutes
        restPhase++;
        if (restPhase == 2) { restPhase2 = n }
        if (restPhase == 3) { restPhase3 = n }
        j = 0; //when shorter tahn 2 minutes the length of walkPhase will continue
      } else if (walkPhase > 0) {
        walkPhase--; //only an interrupt from 1 minute. Reset the just added walkPhase
      }
    }
  }
  document.getElementById("WalkLength").innerText = g + " min";
}

function detectTyp() {
  if (sum <= 500) {
    document.getElementById("typ").innerText = " Vor Ort gegessen";
    document.getElementById("EatLength").innerText = "";
  }
  else if (restPhase == 3 && walkPhase == 2) { //1 before break,  1 at store, 1 after break
    document.getElementById("typ").innerText = " Im Restaurant gegessen";
    document.getElementById("EatLength").innerText = " Es wurde " + restPhase2 + " Minuten lang gegessen.";
  }
  else if ((restPhase == 4 || restPhase == 3) && (walkPhase == 3 || walkPhase == 4)) { //1 before break, 1 at store, 1 at a diffrent place, 1 after break
    document.getElementById("typ").innerText = " Mit Take-Away verpflegt";
    if (restPhase == 3) {
      document.getElementById("EatLength").innerText = "Es wurde " + restPhase3 + " Minuten lang gegessen und unter 2 Minuten auf das Essen gewartet.";
    } else {
      document.getElementById("EatLength").innerText = " Es wurde " + restPhase3 + " Minuten gegessen lang und " + restPhase2 + " Minuten auf das Essen gewartet.";
    }
  }
  else {
    document.getElementById("typ").innerText = " Keinem Profil zuordbar";
    document.getElementById("EatLength").innerText = "";
  }
}

function detectPunctuality() {
  var dataAfter1245 = [];

  dataAfter1245 = data.filter(val => {
    var date = new Date(val.date)
    if ((date.getHours() >= 12 && date.getMinutes() >= 45) && date.getHours() < 13) {
      return true
    }
    return false
  })
  var sum = 0;
  dataAfter1245.forEach(element => {
    sum = sum + element.stepPerMin;
  });
  if (sum > 50) {
    document.getElementById("Punctuality").innerText = "False";
  } else {
    document.getElementById("Punctuality").innerText = "True";
  }
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