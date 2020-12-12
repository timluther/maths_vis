


function logout_user() {
    //auth/logout/a
    console.log("log out");
    $.ajax({
        type: "GET",        
        url: window.origin+"/auth/logout_noredirect/a",
        data: {"noheaders": true },
        dataType: "json",
        success: function (e) {
            console.log("LogoutSuccess:" + e.message ? e.message : e.responseText);
            window.location = window.origin;
        },
        error: function (e) {
            console.log("LogoutFailure:" + e.message ? e.message : e.responseText);
        }
    });
}

function open_user_settings() {
    messageBox("<ul><li>User name</li><li>User avatar</i></ul>", "User Settings");
}

function open_user_menu(event) {
    openOptionsMenu(event, [{ text: "Logout", icon: "ns_logout.svg", onclick: "logout_user(event)" }, { text: "User Settings", icon: "ns_user.svg", onclick: "open_user_settings(event)" }]);
    //
    console.log("Open user menu");
}