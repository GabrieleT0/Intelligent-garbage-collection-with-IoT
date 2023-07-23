load_notifications_panel()
setInterval(load_notifications_panel,60000)

function load_notifications_panel(){  
    fetch("./config.json").then(response => response.json())
    .then(async data => {

        const REST_API_ID = data.REST_API_ID
        
        $.ajax({
            type: 'GET',
            url: `http://localhost:4566/restapis/${REST_API_ID}/test/_user_request_/error_message`,
            success: function (data){
                messages = data.messages
                const pattern_location = /located at ([\d.-]+), ([\d.-]+)/;
                const pattern_IoTid = /id (\d+)/;
                messages_obj = []
                for(var i = 0; i<messages.length; i++){
                    messages_text = messages[i].Body.text_part
                    addresses = messages[i].Destination.ToAddresses
                    timestamp = messages[i].Timestamp
                    const date = new Date(timestamp);
                    date.setHours(date.getHours()+2)
                    const options = { day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "numeric", second: "numeric" };
                    const formattedDate = date.toLocaleString("en", options);
                    converted_date = JSON.stringify(date.toISOString(date.setHours(date.getHours()+2)))
                    match_location = messages_text.match(pattern_location)
                    match_IoT = messages_text.match(pattern_IoTid)
                    var lat, lon, id
                    if(match_location && match_IoT){
                        [_, lat, lon] = match_location
                    }
                    else
                        lat,lon = ''
                    if(match_IoT){
                        [_,id] = match_IoT;
                    }
                    else
                        id = ''
                    
                    link = `errors_map.html?lat=${lat}&lon=${lon}&id=${id}`
                    row = {
                        'ID IoT device' : id,
                        'Location' : lat + ',' + lon,
                        'Date' : formattedDate,
                        'Notification sent to': addresses,
                        'Link Maps': "<a href="+link+" target='_blank' class='link'><img src='img/map.png' width='35'></a>"
                    }
                    messages_obj.push(row)
                }
                if ( $.fn.dataTable.isDataTable( '#email-table' ) ) {
                    table = $('#email-table').DataTable();
                    table.destroy()
                }
                var table = $("#email-table")
                table = table.DataTable({
                    "data": messages_obj,
                    "columns":[
                        {"data":"ID IoT device"},
                        {"data":"Location"},
                        {"data":"Date"},
                        {"data":"Notification sent to"},
                        {"data":"Link Maps"}
                    ]
                })
            },
        })
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