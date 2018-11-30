// JavaScript source code
function add() {
 
    let company = $("#company").val();
    console.log("Company: " + company);

    $.get("/transactions", function(data) {
        console.log(data);

        for (var i = 0; i < data.company.length; i++) {
            var company = data.company[i];
            $("body").append(company);
        }
        
        for (var i = 0; i < data.date.length; i++) {
            var date = data.date[i];
            $("body").append(date);
        }

        for (var i = 0; i < data.amount.length; i++) {
            var amount = data.amount[i];
            $("body").append(amount);
        }
    })
}