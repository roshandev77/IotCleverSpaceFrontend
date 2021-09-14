
console.log("Script loaded")
var temp_data = []
var label_date = []
var arr = []
var mqtt;
var reconnectTimeout = 2000;
var host = '127.0.0.1';
var port = 8083;
var count = 0


function onConnect() {
    console.log('Connected')
    console.log("subscribing to the topic")
    mqtt.subscribe("test-topic")
    mqtt.onMessageArrived = function (message) {
    console.log("Message Arrived: " + message.payloadString);
    if(message.payloadString === 'updated') count ++;
    if(count === 3) {
    onLoad()
    count = 0;
    }
}
}

function MQTTConnect() {
    console.log('Connecting...')
    mqtt = new Paho.MQTT.Client(host, port, 'clientJS')
    var options = {
        timeout: 3,
        onSuccess: onConnect,
    };
    mqtt.connect(options);



}
MQTTConnect()
var onLoad = function() {
    var temp_data = []
    var label_date = []
    var city = 'Patna'
    var t1, t2
    t1 = moment().subtract(1,'days').endOf('day').format("YYYY-MM-DD H:mm");
    t2 = moment().format("YYYY-MM-DD H:mm");
    console.log('current Day: ', t1);
    console.log('todays midnight: ', t2)
    var xhr = new XMLHttpRequest;
    // http://127.0.0.1:5000/get-frame-data?city=Hyderabad&t1=2021-09-04 22:16&t2=2021-09-05 13:17"
     var url = 'http://127.0.0.1:5000/get-frame-data?city=' + city + '&t1=' + t1 + '&t2=' + t2
//    var url = 'https://iotsmartcity.herokuapp.com//get-frame-data?city=' + city + '&t1=' + t1 + '&t2=' + t2
    xhr.open('GET', url, true)
    xhr.onload = function() {
        if(this.status == 200) {
            var data = JSON.parse(this.responseText)
            console.log("Data for last 2 hours: ", data);
            console.log('array length: ',)
            if(data.a !== null) {
              arr = data.a
              for(var i =0; i<arr.length; i++) {
                label_date.push(arr[i].timestamp)
                var temp_in_f = temperatureConverter(arr[i].temp)
                temp_in_f = parseInt(temp_in_f)
                temp_in_f = fToC(temp_in_f)
                temp_in_f = parseInt(temp_in_f)
                console.log("In C", temp_in_f)
                temp_data.push(temp_in_f)
            }
            console.log("Temp is ", JSON.stringify(temp_data))
            console.log("Timestamp is ", JSON.stringify(label_date))
            document.getElementById('line_graph').style.display = "block";
            window.chartColors = {
                red: 'rgb(255, 99, 132)',
                orange: 'rgb(255, 159, 64)',
                yellow: 'rgb(255, 205, 86)',
                green: 'rgb(75, 192, 192)',
                blue: 'rgb(54, 162, 235)',
                purple: 'rgb(153, 102, 255)',
                grey: 'rgb(231,233,237)'
              };
              
              var ctx = document.getElementById("canvas").getContext("2d");
              
              var myChart = new Chart(ctx, {
                type: 'line',
                data: {
                //   labels: ["January", "February", "March", "April", "January", "February", "March", "April", "January", "February", "March", "April"],
                // labels: ["12:35:16", "12:35:16", "12:52:52", "1:11:33", "1:17:09", "1:11:33", "1:33:30", "1:44:53", "2:00:12", "2:05:36"],
                labels: label_date,
                  datasets: [{
                    label: 'Patna City Temperature in C',
                    borderColor: window.chartColors.blue,
                    borderWidth: 2,
                    fill: false,
                    // data: [2, 10, 5, 30, 2, 10, 5, 30, 2, 10, 5, 30]
                    // data: [304.11, 304.11, 303.11, 303.11, 300.11, 303.11, 298.11, 298.11, 298.11, 298.11, 298.11]
                    data: temp_data
                  }]
                },
                options: {
                  responsive: true,
                  title: {
                    display: true,
                    text: ''
                  },
                  tooltips: {
                    mode: 'index',
                    intersect: true
                  },
                  annotation: {
                    annotations: [{
                      type: 'line',
                      mode: 'horizontal',
                      scaleID: 'y-axis-0',
                      value: 5,
                      borderColor: 'rgb(75, 192, 192)',
                      borderWidth: 4,
                      label: {
                        enabled: false,
                        content: 'Test label'
                      }
                    }]
                  }
                }
              });
            }
        }
    }
    xhr.send()
}

onLoad()


var getData = function() {
    console.log("Inside getData");
    var xhr = new XMLHttpRequest;
    var url = 'http://127.0.0.1:5000/get-data?x=' + "Patna"
    xhr.open('GET', url, true)
    xhr.onload = function() {
        if(this.status == 200) {
            // arr = this.responseText.a
            var data = JSON.parse(this.responseText)
            arr = data.a
            console.log("Here is the value from the json: ", typeof(data), typeof(arr));
            for(var i =0; i<arr.length; i++) {
                var timestamp = arr[i].timestamp + "000";
                console.log("The timestamp is ", typeof(parseInt(timestamp)), typeof(arr[i].timestamp))
                var date = new Date(parseInt(timestamp));
                console.log("Debug 1: ", date);
                // date = convert(date)
                date = moment(date).format("YYYY h:mm:ss");
                label_date.push(date)
                var temp_in_f = temperatureConverter(arr[i].temp)
                temp_in_f = fToC(temp_in_f)
                console.log("In C", temp_in_f)
                temp_in_f = parseInt(temp_in_f)
                temp_data.push(temp_in_f)
            }
            console.log("Temp is ", JSON.stringify(temp_data))
            console.log("Timestamp is ", JSON.stringify(label_date))
            return this.responseText
        }
    }
    xhr.send()
}
// getData()

function temperatureConverter(valNum) {
    valNum = parseFloat(valNum);
    return  ((valNum-273.15)*1.8)+32;
    // document.getElementById("outputFahrenheit").innerHTML=
  }

  function fToC(fahrenheit) 
{
  var fTemp = fahrenheit;
  var fToCel = (fTemp - 32) * 5 / 9;
//   var message = fTemp+'\xB0F is ' + fToCel + '\xB0C.';
    return fToCel
} 

function showGraph() {
    document.getElementById('line_graph').style.display = "block";
}

function convert(str) {
    var date = new Date(str),
      mnth = ("0" + (date.getMonth() + 1)).slice(-2),
      day = ("0" + date.getDate()).slice(-2);
    return [date.getFullYear(), mnth, day].join("-");
  }


window.chartColors = {
    red: 'rgb(255, 99, 132)',
    orange: 'rgb(255, 159, 64)',
    yellow: 'rgb(255, 205, 86)',
    green: 'rgb(75, 192, 192)',
    blue: 'rgb(54, 162, 235)',
    purple: 'rgb(153, 102, 255)',
    grey: 'rgb(231,233,237)'
  };
  
  var ctx = document.getElementById("canvas").getContext("2d");
  
  var myChart = new Chart(ctx, {
    type: 'line',
    data: {
    //   labels: ["January", "February", "March", "April", "January", "February", "March", "April", "January", "February", "March", "April"],
    // labels: ["12:35:16", "12:35:16", "12:52:52", "1:11:33", "1:17:09", "1:11:33", "1:33:30", "1:44:53", "2:00:12", "2:05:36"],
    labels: label_date,
      datasets: [{
        label: 'Patna City Temperature in Fahrenheit',
        borderColor: window.chartColors.blue,
        borderWidth: 2,
        fill: false,
        // data: [2, 10, 5, 30, 2, 10, 5, 30, 2, 10, 5, 30]
        // data: [304.11, 304.11, 303.11, 303.11, 300.11, 303.11, 298.11, 298.11, 298.11, 298.11, 298.11]
        data: temp_data
      }]
    },
    options: {
      responsive: true,
      title: {
        display: true,
        text: ''
      },
      tooltips: {
        mode: 'index',
        intersect: true
      },
      annotation: {
        annotations: [{
          type: 'line',
          mode: 'horizontal',
          scaleID: 'y-axis-0',
          value: 5,
          borderColor: 'rgb(75, 192, 192)',
          borderWidth: 4,
          label: {
            enabled: false,
            content: 'Test label'
          }
        }]
      }
    }
  });