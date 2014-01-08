<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class HomePage extends CI_Controller {

	/**
	 * Index Page for this controller.
	 */
	public function index()
	{
    $this->load->model('grid_model');
    $this->load->model('grid_type_model');
    $this->load->model('square_model');

    //  On inclut une vue
    $this->layout->view('homepage');
	}
}

/* End of file homepage.php */
/* Location: ./application/controllers/homepage.php */