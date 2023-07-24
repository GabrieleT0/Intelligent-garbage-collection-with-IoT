async function get_IoT_device_data(id) {
    return new Promise((resolve) => {
        fetch("./config.json")
            .then(response => response.json())
            .then(async configData => {
                const url = `http://localhost:4566/restapis/${configData.REST_API_ID}/test/_user_request_/test`;

                const requestOptions = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({"payload":{"id":id}}),
                };

                const response = await fetch(url, requestOptions);
                const jsonData = await response.json();

                resolve(jsonData);
            })
            .catch(error => {
                console.error('Errore:', error);
                resolve(null);
            });
    });
}

function display_IoT_device_data(){
    var urlParams = new URLSearchParams(window.location.search);
    var id = urlParams.get("id");
    get_IoT_device_data(id).then(jsonData => {
        measurements = []
        for(var i = 0; i<jsonData.length; i++){
            date = new Date(jsonData[i].measure_date)
            date.setTime(date.getTime() + (2 * 60 * 60 * 1000))
            data = [date.getTime(), parseFloat(jsonData[i]['distance(cm)'])]
            measurements.push(data)
        }
        Highcharts.chart({  
            chart: {
                renderTo:'chart-container',
                type: 'line'
            },
            title: {
                style:{
                    fontSize:'30px',
                    fontWeight:'bold'
                },
                text: `Data for sensor with ID ${id}`
            },
            rangeSelector: {
                enabled:true
            },

            xAxis: {
                type:'datetime',
                labels: {
                    formatter: function () {
                        // Aggiungi 2 ore (2 * 60 * 60 * 1000 ms) al timestamp
                        const timestampWithOffset = this.value 
                        const date = new Date(timestampWithOffset);
                        const options = {hour: "numeric", minute: "numeric", second: "numeric" };
                        const formattedDate = date.toLocaleString("en", options);
                        return formattedDate;
                    }
                }
            },
            yAxis: {
                min: 0,
                max: 120,
                tickInterval: 20,
                title:{
                    text: 'Trash distance from the sensor'
                },
                plotBands: [
                    {
                        from: 0, 
                        to: 30, 
                        color: 'rgba(255, 63, 91, 0.2)', 
                        label: {
                            text: 'TO BE EMPTIED!', 
                            align: 'center',
                            style: {
                            color: '#606060'
                            }
                        }
                    },
                    {
                        from: 30, 
                        to: 60, 
                        color: 'rgba(245, 127, 23, 0.2)', 
                        label: {
                            text: 'HIGH', 
                            align: 'center',
                            style: {
                            color: '#606060'
                            }
                        }
                    },                
                    {
                        from: 60, 
                        to: 90, 
                        color: 'rgba(251, 192, 45, 0.2)', 
                        label: {
                            text: 'MEDIUM', 
                            align: 'center',
                            style: {
                                color: '#606060'
                                }
                        }
                    },
                    {
                        from: 90, 
                        to: 110, 
                        color: 'rgba(200, 255, 0, 0.2)', 
                        label: {
                            text: 'LOW', 
                            align: 'center',
                            style: {
                                color: '#606060'
                                }
                        }
                    },
                    {
                        from: 110, 
                        to: 120, 
                        color: 'rgba(0, 255, 98, 0.2)', 
                        label: {
                            text: 'EMPTY', 
                            align: 'center',
                            style: {
                                color: '#606060'
                                }
                        }
                    },
                  ]
            },
            tooltip: {
                formatter: function () {
                  const date = new Date(this.x);
                  const options = { day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "numeric", second: "numeric" };
                  const formattedDate = date.toLocaleString("en", options);
            
                  return `<b>Measurement date</b> ${formattedDate}<br/><b>Trash distance from the sensor:</b> ${this.y} cm `;
                },
              },
            series: [{
                name: 'Trash level',
                data: measurements,
            }]
        });
    })
}

function populate_menu(){
    sensors_list = document.getElementById('sensors_list')
    getIoTData().then(jsonData => {
        for(var i = 0; i<jsonData.length; i++){
            console.log(jsonData[i].device_id)
            var button = document.createElement("button")
            button.textContent = `Device ID: ${jsonData[i].device_id}`
            button.dataset.target = `${jsonData[i].device_id}`
            button.classList.add("button", "is-info", "is-outlined")
            button.addEventListener("click",refresh_line_chart)
            var link = document.createElement("a")
            link.classList.add("panel-block", "is-active")
            link.appendChild(button)
            sensors_list.appendChild(link)
        }
    });
}

function refresh_line_chart(event){
    var button = event.target
    var device_id = button.dataset.target
    console.log(device_id)
    get_IoT_device_data(device_id).then(jsonData => {
        measurements = []
        for(var i = 0; i<jsonData.length; i++){
            date = new Date(jsonData[i].measure_date)
            date.setTime(date.getTime() + (2 * 60 * 60 * 1000))
            data = [date.getTime(), parseFloat(jsonData[i]['distance(cm)'])]
            measurements.push(data)
        }
        Highcharts.chart({  
            chart: {
                renderTo:'chart-container',
                type: 'line'
            },
            title: {
                style:{
                    fontSize:'30px',
                    fontWeight:'bold'
                },
                text: `Data for sensor with ID ${device_id}`
            },
            rangeSelector: {
                enabled:true
            },

            xAxis: {
                type:'datetime',
                labels: {
                    formatter: function () {
                        // Aggiungi 2 ore (2 * 60 * 60 * 1000 ms) al timestamp
                        const timestampWithOffset = this.value 
                        const date = new Date(timestampWithOffset);
                        const options = {hour: "numeric", minute: "numeric", second: "numeric" };
                        const formattedDate = date.toLocaleString("en", options);
                        return formattedDate;
                    }
                }
            },
            yAxis: {
                min: 0,
                max: 120,
                tickInterval: 20,
                title:{
                    text: 'Trash distance from the sensor'
                },
                plotBands: [
                    {
                        from: 0, 
                        to: 30, 
                        color: 'rgba(255, 63, 91, 0.2)', 
                        label: {
                            text: 'TO BE EMPTIED!', 
                            align: 'center',
                            style: {
                            color: '#606060'
                            }
                        }
                    },
                    {
                        from: 30, 
                        to: 60, 
                        color: 'rgba(245, 127, 23, 0.2)', 
                        label: {
                            text: 'HIGH', 
                            align: 'center',
                            style: {
                            color: '#606060'
                            }
                        }
                    },                
                    {
                        from: 60, 
                        to: 90, 
                        color: 'rgba(251, 192, 45, 0.2)', 
                        label: {
                            text: 'MEDIUM', 
                            align: 'center',
                            style: {
                                color: '#606060'
                                }
                        }
                    },
                    {
                        from: 90, 
                        to: 110, 
                        color: 'rgba(200, 255, 0, 0.2)', 
                        label: {
                            text: 'LOW', 
                            align: 'center',
                            style: {
                                color: '#606060'
                                }
                        }
                    },
                    {
                        from: 110, 
                        to: 120, 
                        color: 'rgba(0, 255, 98, 0.2)', 
                        label: {
                            text: 'EMPTY', 
                            align: 'center',
                            style: {
                                color: '#606060'
                                }
                        }
                    },
                  ]
            },
            tooltip: {
                formatter: function () {
                  const date = new Date(this.x);
                  const options = { day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "numeric", second: "numeric" };
                  const formattedDate = date.toLocaleString("en", options);
            
                  return `<b>Measurement date</b> ${formattedDate}<br/><b>Trash distance from the sensor:</b> ${this.y} cm `;
                },
              },
            series: [{
                name: 'Trash level',
                data: measurements,
            }]
        });
    })
}

document.addEventListener('DOMContentLoaded', () => {

    // Get all "navbar-burger" elements
    const $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);
  
    // Check if there are any navbar burgers
    if ($navbarBurgers.length > 0) {
  
      // Add a click event on each of them
      $navbarBurgers.forEach( el => {
        el.addEventListener('click', () => {
  
          // Get the target from the "data-target" attribute
          const target = el.dataset.target;
          const $target = document.getElementById(target);
  
          // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
          el.classList.toggle('is-active');
          $target.classList.toggle('is-active');
  
        });
      });
    }
  });

  populate_menu()