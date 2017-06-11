
$(function() {
    $.get("https://ez-vote.herokuapp.com/access-token" + location.search).done(function(user) {
        $("#personal-message").html("Hello " + user.name);
        console.log(user);
        console.log(user.name);
    });
});
