<?php  if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Grid_model extends CI_Model
{
    protected $table = 'grid';
    
    /**
     *  Ajoute une grille
     */
    public function add_grid($type)
    {
      switch ($type)
      {
        case '2x2': 
          $this->db->set('type',  $type);
          $this->db->set('tmst_update', 'NOW()', false);
          $this->db->set('tmst_create', 'NOW()', false);
          return $this->db->insert($this->table);
        case '3x3': 
          $this->db->set('type',  $type);
          $this->db->set('tmst_update', 'NOW()', false);
          $this->db->set('tmst_create', 'NOW()', false);
          return $this->db->insert($this->table);
       case '4x4': 
          $this->db->set('type',  $type);
          $this->db->set('tmst_update', 'NOW()', false);
          $this->db->set('tmst_create', 'NOW()', false);
          return $this->db->insert($this->table);
        default :
          return FALSE;
      }
      return FALSE;  
    }
  
    /**
     *  Supprime une grille
     */
    public function delete_grid($id)
    {
      return FALSE;   
    }
    
 
    /**
     *  Retourne les infos sur la grille
     */
    public function get_grid($id)
    {
      return FALSE;     
    }
    
    /**
     *  Retourne les infos sur la grille
     */
    public function get_active_grids()
    {
      return FALSE; 
    }
}