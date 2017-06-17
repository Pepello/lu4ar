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
    <header>
      <nav class="teal">
        <div class="nav-wrapper">
          <a href="#" class="brand-logo center">LU4R - Web Interface</a>
        </div>
      </nav>
    </header>
    <main class="container">
      <div id="content" class="card-panel">
        <div class="row section">
          <h4 class="col s12 center">LU4R Project</h4>
          <span class="col s12 center f8">adaptive spoken Language Understanding For Robots</span>
        </div>
        <form id="form" class="row valign-wrapper valign-wrapper-med-and-up">
          <div class="input-field col s12 m8 valign">
            <i class="material-icons prefix">keyboard</i>
            <input id="command" type="text" class="teal-text f8" name="command">
            <label for="command" class="f8">Enter a command</label>
          </div>
          <h5 class="col s12 m2 valign center teal-text">or</h5>
          <div class="col s8 m3 offset-s2 offset-m0 valign">
            <a id="mic" class="center-block btn hoverable"><div class="f9">speak it</div><i class="material-icons f9">mic</i></a>
          </div>
        </form>
        <div class="row">
          <div id="panel" class="col s12 l3 card-panel">
            <ul class="tabs tabs-fixed-width">
              <li class="tab"><a href="#maps" class="teal-text">Maps</a></li>
              <li class="tab"><a href="#objects" class="active teal-text">Objects</a></li>
              <li class="tab"><a href="#others" class="teal-text">Alternatives</a></li>
            </ul>
            <div id="maps" class="">
              <ul class="collection">
              </ul>
            </div>
            <div id="objects" class="">
              <ul class="collection">
              </ul>
            </div>
            <div id="others" class="">
            </div>
          </div>
          <div class="col s12 l9">
            <canvas id="map"></canvas>
          </div>
        </div>
      </div>
    </main>
    <section id="uni-logos" class="row teal lighten-1">
      <div class="col s10 m4 offset-s1 offset-m1">
        <div class="row">
          <a class="col s12" href="#"><img class="responsive-img" src="res/logos/uniroma2_logo.png" alt=""></a>
        </div>
        <div class="divider teal lighten-4"></div>
        <div class="row">
          <h5 class="col s12 center">University of Rome Tor Vergata</h5>
        </div>
      </div>
      <div class="col s10 m4 offset-s1 offset-m2">
        <div class="row">
          <a class="col s12" href="#"><img class="responsive-img" src="res/logos/uniroma1_logo.png" alt=""></a>
        </div>
        <div class="divider teal lighten-4"></div>
        <div class="row">
          <h5 class="col s12 center">University of Rome La Sapienza</h5>
        </div>
      </div>
    </section>
    <footer class="page-footer teal">
      <div class="container">
        <div class="row">
          <div class="col l6 s12">
            <h5 class="white-text">LU4R Project</h5>
            <p class="grey-text text-lighten-4">adaptive spoken Language Understanding For Robots</p>
          </div>
          <div class="col l4 offset-l2 s12">
            <h5 class="white-text">Links</h5>
            <ul>
              <li><a class="grey-text text-lighten-3" href="http://sag.art.uniroma2.it/lu4r.html">Lu4r page</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div class="footer-copyright teal darken-2">
        <div class="container">
        © 2017 Copyright
        <a class="grey-text text-lighten-4 right" href="#!">More Links</a>
        </div>
      </div>
    </footer>
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
