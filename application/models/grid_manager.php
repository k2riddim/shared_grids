<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Grid_manager extends CI_Model {

	/**
	 * Index Page for this controller.
	 */
	public function _create_grid($type)
	{
      $this->load->model('grid_model');
      $this->load->model('square_model');
      
      log_message('debug', 'Grid_manager > _create_grid with type = '.$type);
      
      $result = $this->grid_model->add_grid($type);
      if ($result != FALSE)
      {
        $grid_id = $result;
        $result_sq = $this->square_model->add_all_squares($grid_id, $type);
        if ($result_sq != FALSE)
        {
          return  $grid_id;
        }
        else 
        {
          // TODO gestion erreur SQL
          log_message('error', 'Grid-manager : erreur SQL lors de la creation des cases : '.$result_sq);
        }
      } 
      else
      {
        // TODO gestion erreur SQL
        log_message('error', 'Grid-manager : erreur SQL lors de la creation de la grille : '.$result);
      }   
	}
  
  public function _delete_grid($grid_id)
	{
      $this->load->model('grid_model');
      $this->load->model('square_model');
      
      $result = $this->grid_model->delete_grid($grid_id);
      if ($result != FALSE)
      {
          return $grid_id;
      }
      else 
      {
        // TODO gestion erreur SQL
        log_message('error', 'Grid-manager : erreur SQL lors du delete de la grille : '.$result);
      }

	}
}

/* End of file grid_manager.php */
/* Location: ./application/controllers/grid_manager.php */