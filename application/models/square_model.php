<?php  if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Square_model extends CI_Model
{
    protected $table = 'square';
    
    /**
     *  Ajoute toutes les cases d'une grille.
     *  TODO : meilleur automatisation en fonction du type/size.
     *  TODO : gestion des erreurs SQL.         
     */
    public function add_all_squares($grid_id, $type)
    {
      log_message('debug', 'Square_model > add_all_squares : $grid_id ='.$grid_id.' , $type ='.$type);
      switch ($type)
      {
        case '2x2':
          log_message('debug', 'Square_model > add_all_squares : case 2x2');
          for ($i = 0; $i<4 ; $i++)
          {  
            log_message('debug', 'Square_model > dans boucle $i='.$i);
            $result[$i] = $this->add_square($grid_id, $i);
          }
          break;
       
        case '3x3':
          log_message('debug', 'Square_model > add_all_squares : case 3x3');
          for ($i = 0; $i<9 ; $i++)
          { 
            $result[$i] = $this->add_square($grid_id, $i);
          }
          break;
          
       case '4x4': 
          log_message('debug', 'Square_model > add_all_squares : case 4x4');
          for ($i = 0; $i<16 ; $i++)
          { 
            $result[$i] = $this->add_square($grid_id, $i);
          }
          break;
          
        default :
          log_message('debug', 'Square_model > add_all_squares : case default');
          return FALSE;
      }
      // TODO : supprimer les derniers inserts si un des insert est FALSE.
      for ($j = 0; $j < count($result); $j++)
      {
        log_message('debug', 'Square_model > result['.$j.'] : '.$result[$j]);
        if ($result[$j] = FALSE)
        {
          log_message('error','Square_model : erreur insertion square > grid : '.$grid_id.' square : '.$j);
          return FALSE;
        }
      }
      return TRUE; 
    }
                                
    /**
     * Ajoute une case
     */         
    public function add_square($grid_id, $id)
    {
      log_message('debug', 'Square_model > add_square : $grid_id='.$grid_id.', $id='.$id);
      $this->db->set('grid_id',  $grid_id);
      $this->db->set('id',  $id);
      $this->db->set('tmst_update', 'NOW()', false);
      $this->db->set('tmst_create', 'NOW()', false);
      $result = $this->db->insert($this->table);
      log_message('debug', 'Square_model > add_square : $result='.$result);
      return $result;
    }
    
    /**
     *  Supprime une case
     */
    public function delete_square($id, $grid_id)
    {
      $this->db->where('id',  $id);
      $this->db->where('grid_id',  $grid_id);
      return $this->db->delete($this->table); 
    }
 
    /**
     *  Met à jour l'état d'une case
     */
    public function set_square_state($state)
    {
      $this->db->set('state',  $state);
      return $this->db->update($this->table);
    }
    
    /**
     *  Met à jour l'état d'une case
     */
    public function set_sender_adress($id)
    {
      return FALSE;  
    }
    
    /**
     *  Retourne l'ensemble des cases d'une grille
     */
    public function get_squares_from_grid($grid_id)
    {
      return FALSE;  
    }
}