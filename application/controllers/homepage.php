<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class HomePage extends CI_Controller {

	/**
	 * Index Page for this controller.
	 * TODO meilleur gestion du type de grille.       
	 */
	public function index()
	{   
    $this->load->model('grid_model');
    
    log_message('debug', 'Homepage>index>');
    
    $data['aGridx2'] = $this->grid_model->get_active_grids('2x2');   
    $data['aGridx3'] = $this->grid_model->get_active_grids('3x3');   
    $data['aGridx4'] = $this->grid_model->get_active_grids('4x4');
          
    $this->load->view('homepage', $data);
	}
  
  /**
   * Cr�ation d'une grille et de ses cases en fonction de sa taille.  
   * Grace au controller grid_manager  
   * TODO s�cu : controle sur la cr�ation (user sp�cifique ?)     
  */
  public function create_grids($type)
  {
    log_message('debug', 'Homepage>create_grids>$type='.$type);
    $this->load->model('grid_manager');
    
    // Grid creation    
    $result = $this->grid_manager->_create_grid($type);
    if ($result != FALSE)
    {
      $data['type'] = $type;
      $data['added_grid'] = $result;
      $this->db_form($data);
    } 
    else
    {
      $data['error'] = 'erreur dans le traitement de la creation';
      $this->db_form($data);
    }    
  }
  
  /**
   * Delete d'une grille et de ses cases en fonction de sa taille.  
   * Grace au controller grid_manager  
   * TODO s�cu : supprimer cette m�thode ?     
  */
  public function delete_grid()
  {
    $this->load->model('grid_manager');
    $grid_id = $this->input->post('grid_id');
    $result = $this->grid_manager->_delete_grid($grid_id);
    if ($result)
    {
      $data['grid_id'] = $grid_id;
      $this->db_form($data);
    } 
    else
    {
      $data['error'] = 'erreur dans le traitement du delete';
      $this->db_form($data);
    }
  }
  
  /**
   *   fonction permettant de g�rer les donn�es � afficher dans la view db_form.
   */   
  public function db_form($data = '')
  {
    // on veut r�cup�rer la liste des grille actives pour afficher leur ID.
    $this->load->model('grid_model');
    
    log_message('debug', 'Homepage>db_form>');
    
    $data['aGridx2'] = $this->grid_model->get_active_grids('2x2');   
    $data['aGridx3'] = $this->grid_model->get_active_grids('3x3');   
    $data['aGridx4'] = $this->grid_model->get_active_grids('4x4');   
    
    $this->load->view('db_form', $data);
  }
}

/* End of file homepage.php */
/* Location: ./application/controllers/homepage.php */