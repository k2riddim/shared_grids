<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class HomePage extends CI_Controller {

	/**
	 * Index Page for this controller.
	 * TODO meilleur gestion du type de grille. 
	 * Peut être créer une classe de grille qui permettrait l'héritage 
	 * pour une classe / type de grille.      
	 */
	public function index()
	{      
    $this->load->view('homepage');
	}
  
  /**
   * Création d'une grille et de ses cases en fonction de sa taille.  
   * Grace au controller grid_manager  
   * TODO sécu : controle sur la création (user spécifique ?)     
  */
  public function create_grids($type)
  {
    $this->load->model('grid_manager');
    $result = $this->grid_manager->_create_grid($type);
    if ($result)
    {
      $data['type'] = $type;
      $this->load->view('db_form', $data);
    } 
    else
    {
      $data['error'] = 'erreur dans le traitement de la creation';
      $this->load->view('db_form', $data);
    }    
  }
  
  /**
   * Delete d'une grille et de ses cases en fonction de sa taille.  
   * Grace au controller grid_manager  
   * TODO sécu : supprimer cette méthode ?     
  */
  public function delete_grid()
  {
    $this->load->model('grid_manager');
    $grid_id = $this->input->post('grid_id');
    $result = $this->grid_manager->_delete_grid($grid_id);
    if ($result)
    {
      $data['grid_id'] = $grid_id;
      $this->load->view('db_form', $data);
    } 
    else
    {
      $data['error'] = 'erreur dans le traitement du delete';
      $this->load->view('db_form', $data);
    }
		
  }
}

/* End of file homepage.php */
/* Location: ./application/controllers/homepage.php */