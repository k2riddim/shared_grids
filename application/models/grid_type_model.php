<?php  if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Grid_type_model extends CI_Model
{
    protected $table = 'grid_type';
    
    /**
    *  Retourne la taille d'une grille
    */
    public function get_size($label)
    {
        return $this->db->select('size')
                ->from($this->table)
                ->where('label', $label)
                ->get()
                ->result();
    }
    
}