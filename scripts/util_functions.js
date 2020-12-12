import {CMenuNav} from "/scripts/CMenuNav.js";
import {activateVisibleScenes} from "/scripts/CScene.js"


export function pauseEvent(e) {
    if (e.stopPropagation) e.stopPropagation();
    if (e.preventDefault) e.preventDefault();
    e.cancelBubble = true;
    e.returnValue = false;
    return false;
}

export function grabJson(path, onComplete = null) {
    $.ajax({
        type: "GET",
        url: path,
        contentType: "application/json",
        dataType: "json",
        success: function (data) {
            if (onComplete)
                onComplete(data);
        },
        error: function (data) 
        {
            var respons = data.getAllResponseHeaders();
            console.log("failed to grab" + path)
        }
    });
}

export function doMainPaneUpdate(path, callfunc = "", onComplete = undefined) {
    $.ajax({
        type: "GET",
        data: { "noheaders": true },
        url: path,
        contentType: "text/html",
        dataType: "html",
        success: function (data) {
            var mainpane = $("#mainpane");

            mainpane.html(data).promise().done(function () {
                if ((callfunc != undefined) && (callfunc != "")) {
                    if (isFunction(callfunc))
                        callfunc(onComplete);
                    else
                        window[callfunc](onComplete);
                }
            });
            //console.log(data);
        },
        error: function (data) {
            console.log("failed to grab" + path)
        }
    });
}



function navCallBack(data, onComplete) {
    var innerData = data ? data : [{ "href": "home" }];
    console.log(innerData);
    var path = "?";
    for (var i = 0; i < innerData.length; ++i) {
        if (innerData[i].item.eid)
            path += innerData[i].item.eid + "&";
    }
    var callfunc = (data.length > 0) ? data[data.length - 1]['initfunc'] : undefined;
    window.history.pushState({ page: path, callfunc: callfunc, onComplete: onComplete }, path, path);
    setPageVisibility(data);
    /*if (onComplete != false)
        doMainPaneUpdate(path, callfunc, onComplete);*/
}

export function handlePathAddressDirectly() {
    const prefix = "";
    var trimpath = window.location.pathname.replace(prefix, "");
    var directPages = window.location.search.substring(1).split("&");
    if (directPages.length != 0)
        setPageVisibilityFromID(directPages[0]);
    window.navmenus.setLevelDirectly(trimpath);
}

export function setPageVisibilityFromID(id)
{
    var mc = $("#maincontainer");
    var mcc = mc.children();
    mcc.each(function () {
          $(this).addClass("hidden");
    });
    if ((id !== undefined) && (id != ""))
    {       
        var disp = $("#" + id);
        disp.removeClass("hidden");
        
    }
    else
    {
        $("#welcome").removeClass("hidden");
    }
    activateVisibleScenes();
}

export function setPageVisibility(data)
{
    if (data.length > 0) {
        var topnav = data[data.length - 1].item;
        setPageVisibilityFromID(topnav.eid);
    }
}

export function innerNav(data, onComplete)
{
    var innerData = data ? data : [{ "href": "home" }];
    console.log(innerData);
    var path = "?";
    for (var i = 0; i < innerData.length; ++i) {
        path += innerData[i].eid + "/";
    }
    var callfunc = (data.length > 0) ? data[data.length - 1]['initfunc'] : undefined;
    window.history.pushState({ page: path, callfunc: callfunc, onComplete: onComplete }, path, path);
    setPageVisibility(data);
}



$(document).ready(
    function () {
        //window.mockServerURL = gMockServerURL;
        window.doMainPaneUpdate = doMainPaneUpdate;        

     
        
        var menus = new CMenuNav();
        window.navmenus = menus;
        grabJson("/menus.json",
            function (data) {
                menus.setData(data, navCallBack);
                handlePathAddressDirectly();
            });


        window.addEventListener('popstate', function (e) {
            if (e.state) {
               // doMainPaneUpdate(window.location.pathname, e.state.callfunc, e.state.onComplete);
            }
            else {
                //doMainPaneUpdate(window.location.pathname);
            }
            handlePathAddressDirectly();
        });
        
    });