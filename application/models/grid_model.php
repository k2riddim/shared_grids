<?php  if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Grid_model extends CI_Model
{
    protected $table = 'grid';
    
    /**
     *  Ajoute une grille
     *  Attention on n'ajoute pas les cases de la grille dans ce modèle.          
     */
    public function add_grid($type)
    {
      log_message('debug', 'Grid_model > add_grid with type = '.$type);
      switch ($type)
      {
        case '2x2': 
          log_message('debug', 'Grid_model > add_grid : case 2x2');
          $this->db->set('type', $type);
          $this->db->set('tmst_create', 'NOW()', false);
          $result = $this->db->insert($this->table);
          log_message('debug', 'Grid_model > add_grid : result = '.$result);
          break;
        case '3x3':
          log_message('debug', 'Grid_model > add_grid : case 3x3'); 
          $this->db->set('type', $type);
          $this->db->set('tmst_create', 'NOW()', false);
          $result = $this->db->insert($this->table);
          log_message('debug', 'Grid_model > add_grid : result = '.$result);
          break;
       case '4x4':
          log_message('debug', 'Grid_model > add_grid : case 4x4'); 
          $this->db->set('type',  $type);
          $this->db->set('tmst_create', 'NOW()', false);
          $result = $this->db->insert($this->table);
          log_message('debug', 'Grid_model > add_grid : result = '.$result); 
          break;
        default :
          log_message('debug', 'Grid_model > add_grid : case default');
          return FALSE;
      }
      if ($result = TRUE)
        {
          return $this->db->insert_id();
        }
        else
        {
          return FALSE;
        } 
    }
  
    /**
     *  Supprime une grille
     *  Attention on ne supprime pas les cases de la grille, et ça peut générer des erreurs.     
     */
    public function delete_grid($id)
    {
      $this->db->where('id',  $id);
      return $this->db->delete($this->table);
    }
    
 
    /**
     *  Retourne les infos sur la grille
     */
    public function get_grid($id)
    {
      return FALSE;     
    }
    
    /**
     *  Retourne les grilles actives pour un type
     */
    public function get_active_grids($type)
    {
      return $this->db->select('*')
            ->from($this->table)
            ->where('state',TRUE)
            ->where('type',$type)
            ->get()
            ->result();
    }
}