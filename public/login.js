$("#loginBtn").click(function(){
    $.ajax({
      type : 'POST',
      url : '/',
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
      url : '/',
      data : loginData,
      success: function(data){
      $("#mainDiv").html(data);
      }
});
});