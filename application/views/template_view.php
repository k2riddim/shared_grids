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
  <div id="wrap">
    <?php
      $this->load->view('navbar',$navbar);    
      $this->load->view($body,$body_data);    
    ?>
  </div>
  <?php
    $this->load->view('footer',$footer);
  ?>
  <script src="http://code.jquery.com/jquery.js"></script>
  <script src="<?php echo js_url("bootstrap.min");?>"></script>
</body>
</html>