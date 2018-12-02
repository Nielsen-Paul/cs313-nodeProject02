function load() {

    $.get("/signIn", function(data) {
        console.log(data);

        for (var i = 0; i < data.length; i++) {
            var info = data[i];

            var text = info.name + " " + info.password + "<br>";
                                
            $("body").append(text);
        }
    })
}