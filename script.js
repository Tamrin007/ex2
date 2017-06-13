var $ = require('jquery');
var fs = require('fs-extra');
var isFirstTime = true;
var emotions = [];
var expressions = [];
var video = document.getElementById("video");

// SDK Needs to create video and canvas nodes in the DOM in order to function
// Here we are adding those nodes a predefined div.
var divRoot = $("#affdex_elements")[0];
var width = 640;
var height = 480;
var faceMode = affdex.FaceDetectorMode.LARGE_FACES;
//Construct a CameraDetector and specify the image width / height and face detector mode.
var detector = new affdex.CameraDetector(divRoot, width, height, faceMode);

//Enable detection of all Expressions, Emotions and Emojis classifiers.
detector.detectAllEmotions();
detector.detectAllExpressions();

//Add a callback to notify when the detector is initialized and ready for runing.
detector.addEventListener("onInitializeSuccess", function() {
    log('#logs', "The detector reports initialized");
    //Display canvas instead of video feed because we want to draw the feature points on it
    $("#face_video_canvas").css("display", "block");
    $("#face_video").css("display", "none");
});

function log(node_name, msg) {
    $(node_name).append("<span>" + msg + "</span><br />")
}

//function executes when Start button is pushed.
function onStart() {
    if (detector && !detector.isRunning) {
        $("#logs").html("");
        detector.start();
    }
    log('#logs', "Clicked the start button");
	$("#start").hide();
}

//function executes when the Stop button is pushed.
function onStop() {
    log('#logs', "Clicked the stop button");
    if (detector && detector.isRunning) {
        detector.removeEventListener();
        detector.stop();
	}
	console.log(emotions);
	var time = new Date();
	var dirName = __dirname + '/../../../../' + time.getFullYear() + '_' + time.getMonth() + '_' + time.getDate() + '/';
	var fileNameEmotions = ('0' + time.getHours()).slice(-2) + '_' +('0' + time.getMinutes()).slice(-2) + '_emotions.json';
	writeFile(dirName, fileNameEmotions, JSON.stringify(emotions, null, ' '));
	var fileNameExpressions = ('0' + time.getHours()).slice(-2) + '_' + ('0' + time.getMinutes()).slice(-2) + '_expressions.json';
	writeFile(dirName, fileNameExpressions, JSON.stringify(expressions, null, ' '));
};

//function executes when the Reset button is pushed.
function onReset() {
    log('#logs', "Clicked the reset button");
    if (detector && detector.isRunning) {
        detector.reset();

        $('#results').html("");
    }
};

//Add a callback to notify when camera access is allowed
detector.addEventListener("onWebcamConnectSuccess", function() {
    log('#logs', "Webcam access allowed");
});

//Add a callback to notify when camera access is denied
detector.addEventListener("onWebcamConnectFailure", function() {
    log('#logs', "webcam denied");
    console.log("Webcam access denied");
});

//Add a callback to notify when detector is stopped
detector.addEventListener("onStopSuccess", function() {
    log('#logs', "The detector reports stopped");
    $("#results").html("");
});

//Add a callback to receive the results from processing an image.
//The faces object contains the list of the faces detected in an image.
//Faces object contains probabilities for all the different expressions, emotions and appearance metrics
detector.addEventListener("onImageResultsSuccess", function(faces, image, timestamp) {
    if (isFirstTime) {
        video.play();
		console.log("first");
        isFirstTime = false;
    }
    console.log("Timestamp: " + video.currentTime);
    if (faces.length > 0) {
        faces[0].emotions.timestamp = video.currentTime;
        emotions.push(faces[0].emotions);
        faces[0].expressions.timestamp = video.currentTime;
        expressions.push(faces[0].expressions);
    }
});

video.addEventListener("ended", function(){
	onStop();
}, true);

function writeFile(path, file, data) {
	fs.mkdirsSync(path);
	console.log(path);
	fs.writeFile(path + file, data, function(error) {
		if (error != null) {
			alert('error : ' + error);
		}
	});
}

