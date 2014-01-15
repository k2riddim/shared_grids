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
              <li><a href="<?php echo home_url('');?>">Home</a></li>
              <li><a href="#">About</a></li>
              <li class="active"><a href="<?php echo home_url("homepage/db_form");?>">Database</a></li>
            </ul>
          </div><!--/.nav-collapse -->
        </div>
      </div>

      <!-- Begin page content -->
      <div class="container">
        <div class="page-header">
          <h1>Database form</h1>
        </div>
        <?php 
          if (isset($type))
          {
            echo '<div class="alert alert-success">Grid '.$type.' has been created (id='.$added_grid.')</div>';
          }
          if (isset($grid_id))
          {
            echo '<div class="alert alert-success">Grid '.$grid_id.' has been deleted</div>';
          }
          if (isset($error))
          {
            echo '<div class="alert alert-danger"><span class="glyphicon glyphicon-warning-sign"></span> '.$error.'</div>';
          }
        ?>
        <h3>Liste of active grids :</h3>
        <?php
          if (isset($aGridx2))
          {
            foreach ($aGridx2 as $activegrid)
            {
              echo "<p>2x2 grid id : ".$activegrid->id."</p>";
            }
          }
          if (isset($aGridx3))
          {
            foreach ($aGridx3 as $activegrid)
            {
             echo "<p>3x3 grid id : ".$activegrid->id."</p>";
            }
          }
          if (isset($aGridx4))
          {
            foreach ($aGridx4 as $activegrid)
            {
              echo "<p>4x4 grid id : ".$activegrid->id."</p>";
            }
          }
          if (!isset($aGridx2) && !isset($aGridx3) && !isset($aGridx4))
          {
            echo "<p>no active grid.</p>";
          }
        ?>
        <h3>Creation :</h3>
        <p><a href="<?php echo home_url("homepage/create_grids/2x2");?>">Create a 2x2 grid</a></p>
        <p><a href="<?php echo home_url("homepage/create_grids/3x3");?>">Create a 3x3 grid</a></p>
        <p><a href="<?php echo home_url("homepage/create_grids/4x4");?>">Create a 4x4 grid</a></p>
        <h3>Delete :</h3>
        <?php 
        $attributes['class'] = 'form-inline';
        echo form_open('homepage/delete_grid', $attributes);
        echo form_label('Remove grid : ', 'grid_id');
        
        $input = array(
              'name'        => 'grid_id',
              'placeholder'       => 'id of the grid...',
            );

        echo form_input($input); 
        echo form_submit('mysubmit', 'Submit');
        echo form_close();
        ?>      
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