<?php  if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Grid_model extends CI_Model
{
    protected $table = 'grid';
    
    /**
     *  Ajoute une grille
     *  TODO : gestion erreur li� au type.          
     */
    public function add_grid($type)
    {
      log_message('debug', 'Grid_model > add_grid with type = '.$type);
      $this->db->set('state', TRUE);
      $this->db->set('type',  $type);
      $this->db->set('tmst_create', 'NOW()', FALSE);
      $result = $this->db->insert($this->table);
      
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
     *  Attention on ne supprime pas les cases de la grille, et �a peut g�n�rer des erreurs.     
     */
    public function delete_grid($id)
    {
      log_message('debug', 'Grid_model > delete_grid: $id='.$id); 
      $this->db->where('id',  $id);
      return $this->db->delete($this->table);
    }
    
 
    /**
     *  Retourne les infos sur la grille
     */
    public function get_grid($id)
    {
      log_message('debug', 'Grid_model > get_grid: $id='.$id); 
      return FALSE;     
    }
    
    /**
     *  Retourne les grilles actives pour un type
     */
    public function get_active_grids($type)
    {
      log_message('debug', 'Grid_model > get_active_grids: $type='.$type); 
      return $this->db->select('*')
            ->from($this->table)
            ->where('state',TRUE)
            ->where('type',$type)
            ->get()
            ->result();
    }
    
    /**
     *  Retourne le nombre de grilles actives pour un type
     */
    public function get_nb_active_grids($type)
    {
      log_message('debug', 'Grid_model > get_nb_active_grids: $type='.$type); 
      return $this->db->select('*')
            ->from($this->table)
            ->where('state',TRUE)
            ->where('type',$type)
            ->count_all_results();
    }
}