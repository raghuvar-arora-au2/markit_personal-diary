// import { readFile } from "fs";

$("#loginBtn").click(function(){
	$.ajax({
		type : 'GET',
		url : '/login',
		success: function(data){
			$("#loginDiv").html(data);
		}
	});
});

$("#loginForm").click(function(){
	var username  = $("#username").val();
	var password = $("#password").val();
	var loginData ={'username': username,'password':password};
	$.ajax({
		type : 'POST',
		url : '/login',
		data : json,
		success: function(data){
			$("#mainDiv").html(data);
		}
	});
});

function loginWithFacebook() {
	console.log("here");
	FB.login(response => {
		console.log(response)
		const { authResponse: { accessToken, userID } } = response
		var name =FB.api("/me", function (res) {
			name=res.name
			return name
		})
		console.log(name)
		
		fetch("/facebooklogin", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},

			body: JSON.stringify({ accessToken, userID,name:name })
		}).then(res => {
			if(res.redirected){
				window.location =res.url
			}
		})

		FB.api("/me", function (res) {
			console.log(JSON.stringify(res))
		})
	}, { scope: "public_profile,email" })
	return false
}



