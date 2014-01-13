<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<title>Welcome to Shared Grids</title>
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
              <li><a href="#about">About</a></li>
              <li><a href="#contact">Contact</a></li>
              <li class="dropdown">
                <a href="#" class="dropdown-toggle" data-toggle="dropdown">Grids <b class="caret"></b></a>
                <ul class="dropdown-menu">
                  <li class="dropdown-header">Size</li>
                  <li><a href="<?php echo home_url("homepage/create_grids/2x2");?>">2x2</a></li>
                  <li><a href="<?php echo home_url("homepage/create_grids/3x3");?>">3x3</a></li>
                  <li><a href="<?php echo home_url("homepage/create_grids/4x4");?>">4x4</a></li>
                </ul>
              </li>
            </ul>
          </div><!--/.nav-collapse -->
        </div>
      </div>

      <!-- Begin page content -->
      <div class="container">
        <div class="page-header">
          <h1>List of active grids</h1>
        </div>
        <p>Lorem ipsum dolor sit amet consectetuer Mauris cursus vel et Vestibulum. Condimentum id porttitor velit Vivamus congue elit metus condimentum wisi enim. Massa semper Aenean elit amet Curabitur quis wisi tellus elit pretium. Pulvinar Nam felis et eget aliquet id a non pede sit. Pretium dolor cursus magna mollis rutrum pretium suscipit mattis elit.</p>
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