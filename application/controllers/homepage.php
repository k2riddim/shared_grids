<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class HomePage extends CI_Controller {

	/**
	 * Index Page for this controller.
	 * TODO meilleur gestion du type de grille.   
	 */
	public function index()
	{
    /*
    $this->load->model('grid_model');
    $this->load->controller('grid_manager');
    $activegrids = this->grid_model->get_active_grids('2x2');
    
    if($activegrids)
    {
      $this->layout->view('homepage', $activegrids);
    }
    else 
    {
      this->grid_manager->_create_grid('2x2') ;
    }    */
        
      
    $this->load->view('homepage');
	}
  
  public function create_grids($size)
  {
    $data['size'] = $size;

		$this->load->view('db_form', $data);		
  }
  
  public function delete_grid()
  {
    //$this->load->controller('grid_manager');

    $data['grid_id'] = $this->input->post('grid_id');
  	$this->load->view('db_form', $data);
		
  }
}

/* End of file homepage.php */
/* Location: ./application/controllers/homepage.php */