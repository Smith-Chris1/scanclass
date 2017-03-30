//  Variable for picture source and return value format.
var pictureSource;
var destinationType;
// Loading device API libraries.
document.addEventListener("deviceready", onDeviceReady, false);


// device APIs are ready to use.
function onDeviceReady() {
    pictureSource = navigator.camera.PictureSourceType;
    destinationType = navigator.camera.DestinationType;

}


function pickPhoto() {
    navigator.camera.getPicture(resizeImage, onFail, {
        quality: 10,
        destinationType: Camera.DestinationType.FILE_URI,
        sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM,
        correctOrientation: true
    });
}

function resizeImage(url) {
    var img = new Image();
    var canvas = document.createElement("canvas");

    var ctx = canvas.getContext("2d");
    var canvasCopy = document.createElement("canvas");
    // adding it to the body

    var copyContext = canvasCopy.getContext("2d");

    img.onload = function () {
        var ratio = 1;
        // defining cause it wasnt
        var maxWidth = 800,
            maxHeight = 800;

        if (img.width > maxWidth)
            ratio = maxWidth / img.width;
        else if (img.height > maxHeight)
            ratio = maxHeight / img.height;

        canvasCopy.width = img.width;
        canvasCopy.height = img.height;
        copyContext.drawImage(img, 0, 0);

        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;

        ctx.drawImage(canvasCopy, 0, 0, canvas.width, canvas.height);
        var jpegUrl = canvas.toDataURL("image/jpeg");
        send(jpegUrl);
    };
    img.src = url;
}

function test(path) {
    getFileContentAsBase64(path, function (base64Image) {


        console.log(path);
        send(path);
    });
}

function capturePhoto() {
    // Take picture using device camera and retrieve image as base64-encoded string
    navigator.camera.getPicture(resizeImage, onFail, {
        quality: 50,
        destinationType: Camera.DestinationType.FILE_URI
    });
}

function onFail(message) {

}

function send(nativeURI) {

    document.getElementById('loadingImg').style.display = 'inline-block';
    var formData = new FormData();
    formData.append('base64image', nativeURI);
    formData.append("language", "eng");
    formData.append("apikey", "4c3250c6f188957");
    jQuery.ajax({
        url: 'https://api.ocr.space/parse/image',
        data: formData,
        dataType: 'json',
        cache: false,
        contentType: false,
        processData: false,
        type: 'POST',
        //file: nativeURI,
        success: function (ocrParsedResult) {
            //Get the parsed results, exit code and error message and details
            var parsedResults = ocrParsedResult["ParsedResults"];
            var ocrExitCode = ocrParsedResult["OCRExitCode"];
            console.log(ocrExitCode);
            var isErroredOnProcessing = ocrParsedResult["IsErroredOnProcessing"];
            console.log(isErroredOnProcessing);
            var errorMessage = ocrParsedResult["ErrorMessage"];
            console.log(errorMessage);
            var errorDetails = ocrParsedResult["ErrorDetails"];
            console.log(errorDetails);
            var processingTimeInMilliseconds = ocrParsedResult["ProcessingTimeInMilliseconds"];
            //If we have got parsed results, then loop over the results to do something
            console.log(parsedResults);
            if (parsedResults != null) {
                //Loop through the parsed results
                $.each(parsedResults, function (index, value) {
                    var exitCode = value["FileParseExitCode"];
                    var parsedText = value["ParsedText"];
                    var NoNums = parsedText.replace(/\d+/g, '');
                    var names = NoNums.match(/^.*,/gm);
                    var lines = NoNums.split("\n");
                    var namesParsed = "";
                    for (var i = 0; i < lines.length; i++) {
                        if (lines[i].includes(",")) {
                            namesParsed += lines[i];
                        };
                    };
                    //alert(namesParsed);
                    var today = new Date();

                    var dd = today.getDate();
                    var mm = today.getMonth() + 1; //January is 0!
                    var yyyy = today.getFullYear();
                    if (dd < 10) {
                        dd = '0' + dd
                    }
                    if (mm < 10) {
                        mm = '0' + mm
                    }
                    today = mm + '/' + dd + '/' + yyyy;
                    var d = new Date();

                    var h = d.getHours();
                    var m = d.getMinutes();
                    var s = d.getSeconds();

                    h = (h < 10) ? "0" + h : h;
                    m = (m < 10) ? "0" + m : m;
                    s = (s < 10) ? "0" + s : s;

                    var time = (h + ":" + m + ":" + s);

                    var localStorageLength = localStorage.length;
                    for (var i = 0; i <= localStorageLength; i++) {


                        itemNumber = (i + 1);
                        var classKeyNum = "class" + itemNumber;
                        var items = {
                            classNumber: "Class " + itemNumber + " - " + today + " - " + time,
                            classNames: namesParsed
                        };
                    };

                    localStorage.setItem(classKeyNum, JSON.stringify(items));
                    var itemPrint = JSON.parse(localStorage.getItem(classKeyNum));


                    var stored_datas = itemPrint['classNumber'];
                    var ul = document.getElementById("classList");
                    var li = document.createElement("li");
                    var div1 = document.createElement("div");
                    var P = document.createElement("button");
                    var div2 = document.createElement("div");
                    var deleteButton = document.createElement("button");
                    deleteButton.innerText = "-";
                    deleteButton.className = "deleteItemButton";
                    deleteButton.setAttribute('onClick', 'deleteItem("' + classKeyNum + '")');

                    P.setAttribute('onClick', 'showStudents("' + classKeyNum + '")');
                    li.setAttribute('id', classKeyNum);
                    li.className = 'classesItem';
                    P.innerHTML = stored_datas;
                    div1.className = ('classsesItemText');
                    P.className = ('classText');
                    div2.className = ('deleteItem');
                    div2.appendChild(deleteButton);
                    div1.appendChild(P);
                    li.appendChild(div1);
                    li.appendChild(div2);
                    ul.appendChild(li);
                    document.getElementById('loadingImg').style.display = 'none';

                    var errorMessage = value["ParsedTextFileName"];
                    var errorDetails = value["ErrorDetails"];

                    var textOverlay = value["TextOverlay"];
                    var pageText = '';
                    switch (+exitCode) {
                        case 1:
                            pageText = parsedText;
                            break;
                        case 0:
                        case -10:
                        case -20:
                        case -30:
                        case -99:
                        default:
                            pageText += "Error: " + errorMessage;
                            break;
                    }



                });
            }
        }
    });
}

function deleteItem(itemid) {
    var item = document.getElementById(itemid);

    document.getElementById('classList').removeChild(item);
    localStorage.removeItem(itemid);
}

function deleteTasks() {

    while (document.getElementById('classList').firstChild) {
        document.getElementById('classList').removeChild(document.getElementById('classList').firstChild);

        localStorage.clear();
    }
}

function showStudents(classKeyNum) {
    document.getElementById('classNames').style.display = 'inline-block';
    var itemPrint = JSON.parse(localStorage.getItem(classKeyNum));
    var showStudentsFunction = itemPrint['classNames']
    document.getElementById('classCopyID').setAttribute('onClick', 'copyText("' + classKeyNum + '")');
    var ClassNames = document.getElementById("classNames");
    var p = document.createElement("p");
    p.className = ('classText');
    p.innerHTML = showStudentsFunction;
    ClassNames.appendChild(p);

}

function copyText(classNames) {

    //var item = JSON.parse(localStorage.getItem(classNames));
    //var classList = item['classNames'];
    //var text = string(classList);
    //var text = "copy test";
    //cordova.plugins.clipboard.copy(text);
    //cordova.plugins.clipboard.paste(function (text) { alert(text); });
    //var text = "Hello World!";

}

function OKClose() {
    document.getElementById('classNames').style.display = 'none';
    var list = document.getElementById("classNames");
    list.removeChild(list.lastChild);

}

function OKCloseSettings() {
    document.getElementById('settings').style.display = 'none';

}

function settingsOpen() {
    document.getElementById('settings').style.display = 'inline-block';

}

function onLoad() {
    document.getElementById('settings').style.display = 'none';
    document.getElementById('classNames').style.display = 'none';
    document.getElementById('loadingImg').style.display = 'none';

    var localStorageLength = localStorage.length;
    for (var i = 1; i <= localStorageLength; i++) {
        var classKeyNum = "class" + i;
        var itemPrint = JSON.parse(localStorage.getItem(classKeyNum));

        var stored_datas = itemPrint['classNumber'];
        var ul = document.getElementById("classList");
        var li = document.createElement("li");
        var div1 = document.createElement("div");
        var P = document.createElement("button");
        var div2 = document.createElement("div");
        var deleteButton = document.createElement("button");
        deleteButton.innerText = "-";
        deleteButton.className = "deleteItemButton";
        deleteButton.setAttribute('onClick', 'deleteItem("' + classKeyNum + '")');
        P.setAttribute('onClick', 'showStudents("' + classKeyNum + '")');
        li.setAttribute('id', classKeyNum);
        li.className = 'classesItem';
        P.innerHTML = stored_datas;
        div1.className = ('classsesItemText');
        P.className = ('classText');
        div2.className = ('deleteItem');
        div2.appendChild(deleteButton);
        div1.appendChild(P);
        li.appendChild(div1);
        li.appendChild(div2);
        ul.appendChild(li);
    };
}
