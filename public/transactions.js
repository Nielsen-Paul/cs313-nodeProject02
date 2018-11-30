// JavaScript source code
function runSearch() {
    let search = document.getElementById("search").value;
    console.log(search);

    $.ajax({
        url: `http://www.omdbapi.com/?s=${search}&apikey=7e1733ea`
    }).done(function (data) {
        console.log(this);

        let text = "<ul>";
        data.Search.forEach(movie => {
            text += "<li>" + movie.Title + "</li>";
        });
        text += "</ul>";

        $("body").append(text);
    });
}