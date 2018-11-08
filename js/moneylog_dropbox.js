var CLIENT_ID = '42zjexze6mfpf7x';
var APP_PATH = 'Apps/MoneyLog Cloud';
var dbx;
var db_inited = false

function initDropbox(reloading) {
    if(!isAuthenticated()) {
        document.location.href = '/index.html'
        return;
    }
    $("#report").html('<p style=\'text-align: left;\'> ' + i18n.msgLoading.replace('%s', 'preferências e plugins do seu Dropbox...') + '</p>');
    dbx = new Dropbox.Dropbox({ accessToken: getAccessTokenFromUrl() });
    getUserConfig(reloading);
}

function getAccessTokenFromUrl() {
    return utils.parseQueryString(window.location.hash).access_token;
}

function isAuthenticated() {
    return !!getAccessTokenFromUrl();
}

function renderItems(items) {
    items.forEach(function(item) {
        console.log(item.name, item.id);
    });
}

function getUserConfig(reloading) {
    dbx.filesDownload({
        path: '/config.js'
    })
    .then(function(response) {
        var user_js = response.fileBlob;
        var reader = new FileReader();
        reader.addEventListener("loadend", function() {
            eval(reader.result);
            dataFiles = [dataFilesDefault];
            populateDataFilesCombo();
            loadPlugins();
        });
        reader.readAsText(user_js);
        loadExtraFiles();
    }).catch(function(error) { console.error(error); });
}

function getCurrentDataFile(reloading) {
    reloading = reloading || false;
    dbx.filesDownload({
        path: '/txt/' + getSelectedFile()
    })
    .then(function(response) {
        var dtf = response.fileBlob;
        var reader = new FileReader();
        reader.addEventListener("loadend", function() {
            $("#editordata").val(reader.result);
            resetData();
            rawData = reader.result;

            parseData();
            showReport();
            showHideEditButton();
        });
        reader.readAsText(dtf);
    }).catch(function(error) { console.error(error); });
}

function loadPlugins() {
    dbx.filesListFolder({
        path: '/plugins'
    })
    .then(function(response) {
        response.entries.forEach(function(item) {
            if (item.name.split('.').pop() == "js") {
                dbx.filesDownload({
                    path: '/plugins/' + item.name
                })
                .then(function(response) {
                    var plugin = response.fileBlob;
                    var reader = new FileReader();
                    reader.addEventListener("loadend", function() {
                        eval(reader.result);
                    });
                    reader.readAsText(plugin);
                }).catch(function(error) { console.error(error); });
            }
        });
        startDBEngine(true);
    }).catch(function(error) { console.error(error); });
}

function loadExtraFiles() {
    dbx.filesListFolder({
        path: '/txt'
    })
    .then(function(response) {
        response.entries.forEach(function(item) {
            if (item.name != dataFilesDefault) {
                dataFiles.push(item.name);
            }
        });
        populateDataFilesCombo();
    }).catch(function(error) { console.error(error); });
}

function startDBEngine(reloading) {
    reloading = reloading || false
    $("#report").html('<p style=\'text-align: left;\'> ' + i18n.msgLoading.replace('%s', '&lt;Dropbox home&gt;/Apps/MoneyLog Cloud/txt/' + getSelectedFile())   + '</p>');
    $("#about-dropbox-version").html('<a href=http://github.com/xupisco/MoneyLog-Cloud/commit/' + commit_id + '>' + commit_id.slice(0, 6) + '</a>');

    $("#charts").hide();

    // Add logout link...
    if(!db_inited) {
        $('#toolbar-controls-wrapper').append('<div id="logout" style="margin-left: 17px; position: relative; height: 30px;"><a href="/logout" style="color: #2B97E9">Logout</a></div>');
        db_inited = true;
    }

    getCurrentDataFile(reloading);
}

function getUserDataFiles() {
    dbx.filesListFolder({
        path: '/txt'
    })
    .then(function(response) {
        renderItems(response.entries);
    }).catch(function(error) { console.error(error); });
}

function editorSave() {
    $("#editor-buttons").prepend("<div id='saving' style='right: 220px; position: absolute; color: #F44; line-height: 50px;'>" + i18n.msgSaving + "</div>");
    dbx.filesUpload({
        contents: $("#editor-data").val(),
        path: '/txt/' + getSelectedFile(),
        mode: 'overwrite'
    })
    .then(function(response) {
        $("#saving").hide();
        rawData = $("#editor-data").val();
        parseData();
        showReport();
        editorOff();
    }).catch(function(error) { console.error(error); });
    return false;
}

function loadSelectedFile() {
    startDBEngine(true);
}

$(function() {
    
})