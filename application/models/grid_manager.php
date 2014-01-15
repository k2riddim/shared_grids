<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Grid_manager extends CI_Model {
 
	/**
	 * Managing the grid creation / delete / update.
	 */
	public function _create_grid($type)
	{          
    // debug message
    log_message('debug', 'Grid_manager > _create_grid with type = '.$type);
    
    // models load
    $this->load->model('grid_model');
    $this->load->model('square_model');
    
    // active grid restriction
    $nb_active = $this->grid_model->get_nb_active_grids($type);
    if ($nb_active >= NB_MAX_ACTV_GRID)
    {
      log_message('debug', 'Grid_manager > nb_active= '.$nb_active.'> max ('.NB_MAX_ACTV_GRID.')');
      return FALSE;
    }
     
    // adding the grid
    $result = $this->grid_model->add_grid($type);
    
    // testing the query result
    if ($result != FALSE)
    {
      // if ok, create all the squares
      $grid_id = $result;
      $result_sq = $this->square_model->add_all_squares($grid_id, $type);
      if ($result_sq != FALSE)
      {
        return $grid_id;
      }
      else 
      {
        // TODO gestion erreur SQL
        log_message('error', 'Grid-manager : erreur SQL lors de la creation des cases : '.$result_sq);
        return FALSE;
      }
    } 
    else
    {
      // TODO gestion erreur SQL
      log_message('error', 'Grid-manager : erreur SQL lors de la creation de la grille : '.$result);
      return FALSE;
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
        return FALSE;
      }

	}
}

/* End of file grid_manager.php */
/* Location: ./application/controllers/grid_manager.php */