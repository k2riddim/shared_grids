<?php  if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Square_model extends CI_Model
{
    protected $table = 'square';
    
    /**
     *  Ajoute une case pour une grille.
     */
    public function add_square($grid_id)
    {
      return FALSE;  
    }
  
    /**
     *  Supprime une case
     */
    public function delete_square($id)
    {
      return FALSE;  
    }
 
    /**
     *  Met à jour l'état d'une case
     */
    public function set_square_state($id)
    {
      return FALSE;  
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