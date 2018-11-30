function load() {

    $.get("/signIn", function(data) {
        console.log(data);

        for (var i = 0; i < data.name.length; i++) {
            var name = data.name[i];
            $("body").append(name);
        }
        
        for (var i = 0; i < data.password.length; i++) {
            var password = data.password[i];
            $("body").append(password);
        }
    })
}