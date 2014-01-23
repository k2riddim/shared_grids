<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class HomePage extends CI_Controller {

	/**
	 * Index Page for this controller.
	 * TODO meilleur gestion du type de grille.       
	 */
	public function index()
	{   
    $this->load->model('grid_model');
    $this->load->model('square_model');
    
    $data['0'] = '';
    
    log_message('debug', 'Homepage>index>');
    
    $gridx2 = $this->grid_model->get_active_grids('2x2');   
    $gridx3 = $this->grid_model->get_active_grids('3x3');   
    $gridx4 = $this->grid_model->get_active_grids('4x4');
    
    foreach ($gridx2 as $activegrid)
    {
      $squarelistx2[$activegrid->id] = $this->square_model->get_squares_of_grid($activegrid->id);  
    }
    foreach ($gridx3 as $activegrid)
    {
      $squarelistx3[$activegrid->id] = $this->square_model->get_squares_of_grid($activegrid->id);  
    }
    foreach ($gridx4 as $activegrid)
    {
      $squarelistx4[$activegrid->id] = $this->square_model->get_squares_of_grid($activegrid->id);  
    }
    
    if (isset($squarelistx2)){$data['squaresx2'] = $squarelistx2;}
    if (isset($squarelistx3)){$data['squaresx3'] = $squarelistx3;}
    if (isset($squarelistx4)){$data['squaresx4'] = $squarelistx4;}
          
    $this->load->view('homepage', $data);
	}
  
  /**
   * Création d'une grille et de ses cases en fonction de sa taille.  
   * Grace au controller grid_manager  
   * TODO sécu : controle sur la création (user spécifique ?)     
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
      $this->db_form($data);
    } 
    else
    {
      $data['error'] = 'erreur dans le traitement du delete';
      $this->db_form($data);
    }
  }
  
  /**
   *   fonction permettant de gérer les données à afficher dans la view db_form.
   */   
  public function db_form($data = '')
  {
    // on veut récupérer la liste des grille actives pour afficher leur ID.
    $this->load->model('grid_model');
    
    log_message('debug', 'Homepage>db_form>');
    
    $data['aGridx2'] = $this->grid_model->get_active_grids('2x2');   
    $data['aGridx3'] = $this->grid_model->get_active_grids('3x3');   
    $data['aGridx4'] = $this->grid_model->get_active_grids('4x4');   
    
    $this->load->view('db_form', $data);
  }
  
  public function attempt($grid_id, $id)
  {
    $this->load->model('grid_model');
    $this->load->model('square_model');
    
    $square = $this->square_model->get_square($grid_id, $id);
    $grid = $this->grid_model->get_grid($grid_id);
    
    // Si case gagnante
    if ($square[0]->winner)
    { 
      // La grille devient gagnante.
      $this->grid_model->set_grid_state($grid_id, 'win');
      $this->square_model->set_sender_address('debug');
    }
    else
    {
      // S'il n'y a plus assez de cases pour jouer
      if ($this->square_model->count_active_square_of_grid($grid_id) < 3)
      {
        $this->square_model->set_square_state($grid_id, $id, FALSE);
        $this->square_model->set_sender_address('debug');
        $this->grid_model->set_grid_state($grid_id, 'lose');
       
      }
      else
      {
        $this->square_model->set_square_state($grid_id, $id, FALSE);
        $this->square_model->set_sender_address('debug');
      }
        
     }
    
    $this->index();
   }
}

/* End of file homepage.php */
/* Location: ./application/controllers/homepage.php */