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
     switch ($type)
      {
        case '2x2':
          for ($i = 0; $i<4 ; $i++)
          { 
            add_square($grid_id, $i);
          }
          return TRUE;          
        case '3x3':
          for ($i = 0; $i<9 ; $i++)
          { 
            add_square($grid_id, $i);
          }
          return TRUE; 
       case '4x4': 
          for ($i = 0; $i<16 ; $i++)
          { 
            add_square($grid_id, $i);
          }
          return TRUE;
        default :
          return FALSE;
      }
      return FALSE;  

    }
  
  
    public function add_square($grid_id, $id)
    {
      $this->db->set('grid_id',  $grid_id);
      $this->db->set('id',  $id);
      $this->db->set('tmst_update', 'NOW()', false);
      $this->db->set('tmst_create', 'NOW()', false);
      return $this->db->insert($this->table);
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