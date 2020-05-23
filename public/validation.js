function validateEmail(email) {
	var re = /\S+@\S+\.\S+/
	return re.test(email)
}

function validateLength(username) {
	return length(username) > 3
}

function validatePass(pass) {
	return length(pass) >= 8
}

$(document).ready(function () {
	$("#signup_form").bootstrapValidator({
		// To use feedback icons, ensure that you use Bootstrap v3.1.0 or later
		feedbackIcons: {
			valid: "glyphicon glyphicon-ok",
			invalid: "glyphicon glyphicon-remove",
			validating: "glyphicon glyphicon-refresh"
		},
		fields: {
			username: {
				validators: {
					stringLength: {
						min: 3,
					},
					notEmpty: {
						message: "Please supply the username"
					}
				}
			},

			email: {
				validators: {
					notEmpty: {
						message: "Please supply your email address"
					},
					emailAddress: {
						message: "Please supply a valid email address"
					}

				}
			},




			password: {
				validators: {
					stringLength: {
						min: 8,

						message: "Please enter a password of atleat 8 Characters"
					},
					notEmpty: {
						message: "Please supply a password"
					}
				}
			}
		}
	})
		.on("success.form.bv", function (e) {
			// $("#success_message").slideDown({ opacity: "show" }, "slow") // Do something ...
			$("#signup_form").data("bootstrapValidator").resetForm();

			// Prevent form submission
			e.preventDefault();

			// Get the form instance
			// var $form = $(e.target);

			// Get the BootstrapValidator instance
			// var bv = $form.data("bootstrapValidator");

			// Use Ajax to submit form data
			// $.post($form.attr("action"), $form.serialize(), function (result) {
			// 	console.log(result);
			// }, "json");

			// $("#signup-sumbit").click(function(){
				console.log("in post")
				var username  = $("#signup-username").val();
				let email  = $("#email-username").val();
				var password = $("#signup-password").val();
				var loginData ={'username': username,'password':password, "email":email};
				$.ajax({
					type : 'POST',
					url : '/login',
					data : json,
					success: function(data){
						$("#mainDiv").html(data);
					}
				// });
			});
		});



}
)