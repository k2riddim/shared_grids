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
      $this->db->set('state',  TRUE);
      $this->db->set('tmst_update', 'NOW()', FALSE);
      $this->db->set('tmst_create', 'NOW()', FALSE);
      $result = $this->db->insert($this->table);
      log_message('debug', 'Square_model > add_square : $result='.$result);
      return $result;
    }
    
    /**
     *  Supprime une case
     */
    public function delete_square($grid_id, $id)
    {
      $this->db->where('id',  $id);
      $this->db->where('grid_id',  $grid_id);
      return $this->db->delete($this->table); 
    }
 
    /**
     *  Met à jour l'état d'une case
     */
    public function set_square_state($grid_id, $id, $state)
    {
      return $this->db->set('state',  $state)
              ->where('grid_id',  $grid_id)
              ->where('id',  $id)
              ->update($this->table);
    }
    
    /**
     *  Met à jour l'état d'une case
     */
    public function set_sender_address($id)
    {
      return FALSE;  
    }
    
    /**
     *  Retourne l'ensemble des cases d'une grille
     */
    public function get_squares_of_grid($grid_id)
    {
      log_message('debug', 'Square_model > get_squares_of_grid: $grid_id='.$grid_id); 
      return $this->db->select('*')
            ->from($this->table)
            ->where('grid_id',$grid_id)
            ->get()
            ->result();
    }
    
    /**
     *  Retourne une case
     */
    public function get_square($grid_id, $id)
    {
      log_message('debug', 'Square_model > get_square: $grid_id='.$grid_id.' , $id='.$id); 
      return $this->db->select('*')
            ->from($this->table)
            ->where('grid_id',$grid_id)
            ->where('id',$id)
            ->get()
            ->result();
    }
    
    public function count_active_square_of_grid($grid_id)
    {
      log_message('debug', 'Square_model > count_active_square_of_grid: $grid_id='.$grid_id); 
      return $this->db->select('*')
            ->from($this->table)
            ->where('grid_id',$grid_id)
            ->where('state',TRUE)
            ->count_all_results();
    }
}