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
              <!-- li><a href="<?php echo home_url("homepage/db_form");?>">Database</a></li !-->
            </ul>
            <ul class="nav navbar-nav pull-right">
              <li id="a" style="visibility: hidden; display: none; width:0px;"></li>
              <?php
              if ($this->tank_auth->is_logged_in())
              {
                $balance = '';
                echo '<li>'.$username.' | '.$balance.' BTC</li>';
              }
              else
              {
                $login_form = '                
                  <li class="dropdown">
                    <a href="#" class="dropdown-toggle" data-toggle="dropdown"><i class="icon-user icon-white"></i> Sign in <b class="caret"></b></a>
                    <div class="dropdown-menu">';
                    
                $form_attributes = array('style' => 'padding: 19px 19px 0 19px;');
  
                $login = array(
                	'name'	=> 'login',
                	'id'	=> 'login',
                	'value' => set_value('login'),
                );
                
                $password = array(
                	'name'	=> 'password',
                	'id'	=> 'password',
                );
                
                $login_form .= form_open( home_url('auth/login'), $form_attributes);
                $login_form .= form_input($login);
                $login_form .= form_password($password);
                
                $forgot_password_url = home_url('auth/forgot_password/');
                 
                $remember = array(
                	'name'	=> 'remember',
                	'id'	=> 'remember',
                	'value'	=> 1,
                	'checked'	=> set_value('remember'),
                	'style' => 'margin:0;padding:0',
                );

                $login_form .= form_checkbox($remember); 
			          $login_form .= form_label('Remember me', $remember['id']);
                $login_form .= '<span class="help-block"><a href="'.$forgot_password_url.'">I forgot my password</a></span>';
                
                $login_button = array(
                  'name' => 'login',
                  'class' => 'btn btn-primary',
                  'style' => 'margin: 0;',
                  'type' => 'submit',
                  'content' => 'Login'
                );
                
                $login_form .= form_button($login_button);
                $login_form .= '<a href="'.home_url('auth/register').'" class="btn btn-warning" style="margin-left: 5px;">Register</a>';
                $login_form .= form_close();
                $login_form .= '</div></li>';
                    
                echo $login_form;
               }
              ?>
            </ul>
          </div><!--/.nav-collapse -->
        </div>
      </div>

      <!-- Begin page content -->
      <div class="container">
        <div class="page-header">
          <h1>List of active grids</h1>
        </div>
        <?php
        if (isset($login_failed))
        {
          if ($login_failed){          
            echo '<div class="alert alert-danger">Login failed</div>';
            }
        }
        
        if (isset($squaresx2))
        {
          foreach ($squaresx2 as $squares)
          {
            echo produce_grid($squares);
          }
        }
        if (isset($squaresx3))
        {
          foreach ($squaresx3 as $squares)
          {
            echo produce_grid($squares);
          }
        }
        if (isset($squaresx4))
        {
          foreach ($squaresx4 as $squares)
          {
            echo produce_grid($squares);
          }
        }
        ?>  
      </div>
    </div>

    <div id="footer">
      <div class="container">
        <p class="text-muted">Page rendered in <strong>{elapsed_time}</strong> seconds. Your IP is : <?php echo ($this->session->userdata('ip_address'));?></p>
      </div>
    </div>

  <script src="http://code.jquery.com/jquery.js"></script>
  <script src="<?php echo js_url("bootstrap.min");?>"></script>
</body>
</html>