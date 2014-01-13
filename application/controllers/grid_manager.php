<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class GridMananger extends CI_Controller {

	/**
	 * Index Page for this controller.
	 */
	public function _create_grid($type)
	{
      $this->load->model('grid_model');
      $this->load->model('grid_type_model');
      $this->load->model('square_model');
      
      $result = $this->grid_model->add_grid($type)
      $this->square_model->add_all_squares($result[grid_id], $type)
  
	}
  	public function _delete_grid($grid_id)
	{
      $this->load->model('grid_model');
      $this->load->model('grid_type_model');
      $this->load->model('square_model');
      
      $result = $this->grid_model->delete_grid($grid_id)
      $this->square_model->add_all_squares($result[grid_id], $type)
  
	}
}

/* End of file grid_manager.php */
/* Location: ./application/controllers/grid_manager.php */