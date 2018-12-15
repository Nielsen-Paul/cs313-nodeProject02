var moment = require('moment');

function add() {

    $.get("/transactions", function(data) {
        console.log(data);

        for (var i = 0; i < data.length; i++) {
            var info = data[i];
            var longDate = new Date(info.date);
            var date = longDate.toDateString();

            var text = "<tr>" + "<td>" + date + "</td>" + 
                                "<td>" + info.company + "</td>" +
                                "<td>" + "$" + info.amount + "</td>" +
                                "<td>" + "$" + info.total + "</td>" + "</tr>";
                                
            $("#pastTransactions").append(text);
        }
    })
}