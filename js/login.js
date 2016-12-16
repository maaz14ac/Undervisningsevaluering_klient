$(document).ready(function(){
    $('#loginButton').on('click', function(e){
        e.preventDefault();
        login();
    });
});


function login(){
    var email = $('#inputEmail').val();
    var password = $('#inputPassword').val();

    SDK.login(email, password, function(err, data){

        //Forkerte loginoplysninger
        if(err) {
            return $(".form-signin").addClass("has-error");
        }

        //Login OK!
        $(".form-signin").addClass("has-success");


    });
}