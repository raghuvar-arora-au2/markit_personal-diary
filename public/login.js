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