var moment = require('moment');

function add() {

    $.get("/transactions", function(data) {
        console.log(data);

        for (var i = 0; i < data.length; i++) {
            var info = data[i];

            var text = "<tr>" + "<td>" + info.date + "</td>" + 
                                "<td>" + info.company + "</td>" +
                                "<td>" + "$" + info.amount + "</td>" +
                                "<td>" + "$" + info.total + "</td>" + "</tr>";
                                
            $("#pastTransactions").append(text);
        }
    })
}