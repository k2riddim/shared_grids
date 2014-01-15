<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<title>Welcome to Shared Grids</title>
  <link href="<?php echo css_url("grids");?>" rel="stylesheet" media="screen">
  <link href="<?php echo css_url("sticky-footer-navbar");?>" rel="stylesheet" media="screen">
  <link href="<?php echo css_url("bootstrap.min");?>" rel="stylesheet" media="screen">
</head>
<body>
	    <!-- Wrap all page content here -->
    <div id="wrap">
      <!-- Fixed navbar -->
      <div class="navbar navbar-inverse navbar-fixed-top" role="navigation">
        <div class="container">
          <div class="navbar-header">
            <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
              <span class="sr-only">Toggle navigation</span>
              <span class="icon-bar"></span>
              <span class="icon-bar"></span>
              <span class="icon-bar"></span>
            </button>
            <a class="navbar-brand" href="<?php echo home_url('');?>">Shared grids</a>
          </div>
          <div class="collapse navbar-collapse">
            <ul class="nav navbar-nav">
              <li class="active"><a href="<?php echo home_url('');?>">Home</a></li>
              <li><a href="#">About</a></li>
              <li><a href="<?php echo home_url("homepage/db_form");?>">Database</a></li>
            </ul>
          </div><!--/.nav-collapse -->
        </div>
      </div>

      <!-- Begin page content -->
      <div class="container">
        <div class="page-header">
          <h1>List of active grids</h1>
        </div>
        
        <div class="row">
          <div class="col-md-3">
            <div class="grid-line">
              <button type="button" class="btn btn-info"><span class="glyphicon glyphicon-question-sign"></span></button>
              <button type="button" class="btn btn-info"><span class="glyphicon glyphicon-question-sign"></span></button>
            </div>
            <div class="grid-line">
              <button type="button" class="btn btn-danger"><span class="glyphicon glyphicon-remove-sign"></span></button>
              <button type="button" class="btn btn-info"><span class="glyphicon glyphicon-question-sign"></span></button>
            </div>
          </div>
          <div class="col-md-9">
            <p>Lorem ipsum dolor sit amet consectetuer mus Quisque eget dictum cursus. Magna pede nunc Lorem augue nibh eget leo.</p>
            <p>Et Maecenas velit pretium pellentesque ligula In dapibus suscipit Integer.</p>
            <p>At pulvinar tellus tincidunt nibh velit dui ut ligula facilisis tellus. Pede convallis Maecenas enim.</p>
            <p>Urna neque justo et urna orci diam consectetuer Integer tempor eget. In et auctor morbi Quisque.</p>
            <p>Metus est Aenean ipsum urna adipiscing Curabitur.</p>
          </div>
        </div>
      </div>
    </div>

    <div id="footer">
      <div class="container">
        <p class="text-muted">Page rendered in <strong>{elapsed_time}</strong> seconds.</p>
      </div>
    </div>

  <script src="http://code.jquery.com/jquery.js"></script>
  <script src="<?php echo js_url("bootstrap.min");?>"></script>
</body>
</html>