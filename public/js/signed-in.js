
$(function() {

	$.ajax({
		url: "https://ez-vote.herokuapp.com/access-token" + location.search,
		type: 'GET',
		success: function(user) {
			$("#success-message").html("Logged in as " + user.name);
	        console.log(user);
	        console.log(user.name);
		},
		error: function(err) {
			window.location.href = "https://ez-vote.herokuapp.com/sign-in-fail";
		}
	});

	

});
