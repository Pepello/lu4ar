<!DOCTYPE html>
<html id="my-scope" lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>LU4R - Web interface</title>
    <link href="http://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <link rel="stylesheet" href="css/materialize.min.css">
    <link rel="stylesheet" href="css/style.css">
  </head>
  <body class="grey lighten-3 loading">
    <div class="loader">
        <h2 class="grey-text text-darken-3">Caricamento dati in corso</h2>
        <div class="progress">
            <div class="indeterminate"></div>
        </div>
    </div>
    <div id="content" class="container">
        <div class="row">
            <div class="card-panel col s3">
              <div class="row section">
                <h5 class="col s12 center">LU4R Project</h4>
                <span class="col s12 center f9">adaptive spoken Language Understanding For Robots</span>
              </div>
              <form id="form" class="row">
                <div class="input-field col s12">
                  <i class="material-icons prefix">keyboard</i>
                  <input id="command" type="text" class="teal-text" name="command">
                  <label for="command" >Enter a command</label>
                </div>
                <div class="col s12">
                  <a id="mic" class="center-block btn hoverable"><div>speak it</div><i class="material-icons">mic</i></a>
                </div>
              </form>
              <div id="panel">
                <ul class="tabs tabs-fixed-width">
                  <li class="tab"><a href="#map" class="teal-text">Maps</a></li>
                  <li class="tab"><a href="#agent" class="active teal-text">Agents</a></li>
                  <li class="tab"><a href="#object" class="teal-text">Objects</a></li>
                  <li class="tab"><a href="#other" class="teal-text">Alternatives</a></li>
                </ul>
                <div id="map">
                  <ul class="collection">
                  </ul>
                </div>
                <div id="agent">
                  <ul class="collection">
                  </ul>
                </div>
                <div id="object">
                  <ul class="collection">
                  </ul>
                </div>
                <div id="other">
                </div>
              </div>
            </div>
            <div id="canvas-wrapper" class="col s9">
                <canvas id="canvas"></canvas>
            </div>
        </div>
    </div>
    <script src="js/jquery-3.2.0.min.js" charset="utf-8"></script>
    <script src="js/materialize.min.js"></script>
    <script src="js/fabric.min.js"></script>
    <script src="js/objects.js"></script>
    <script src="js/ajax.js"></script>
    <script src="js/speech.js"></script>
    <script src="js/draw.js"></script>
    <script src="js/animation.js"></script>
    <script src="js/init.js"></script>
  </body>
</html>
