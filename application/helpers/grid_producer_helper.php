<?php  if ( ! defined('BASEPATH')) exit('No direct script access allowed');

if ( ! function_exists('produce_grid'))
{
    function produce_grid($squares)
    {  
      $nb_squares = count($squares);   
      $nb_col = intval(sqrt($nb_squares));
      $col = 0;
      $nb_failed = 0;
      $grid_id = array_values($squares)[0]->grid_id;
      $attributes['style'] = 'display:inline';
            
      $html ='  <div class="row" id="'.$grid_id.'">';
      $html .='    <div class="col-md-3">';
      $html .='      <div class="grid-line">';
      
      foreach ($squares as $square)
      {
        if ($square->state)
        {
          $buttonclass = 'btn btn-info';
          $glyph =  'glyphicon glyphicon-question-sign';
        }
        else
        {
          $nb_failed++;
          $buttonclass = 'btn btn-danger';
          $glyph =  'glyphicon glyphicon-remove-sign';
        }
        if ($col < $nb_col)
        {   
          $html .= form_open('homepage/attempt/'.$grid_id.'/'.$square->id, $attributes);
          $html .='        <button type="submit" class="'.$buttonclass.'" id="'.$grid_id.'/'.$square->id.'"><span class="'.$glyph.'"></span></button>';
          $html .= form_close();
          $col++;
        }
        else 
        {
          $html .='      </div>';
          $html .='      <div class="grid-line">';
          $html .= form_open('homepage/attempt/'.$grid_id.'/'.$square->id, $attributes);
          $html .='        <button type="submit" class="'.$buttonclass.'" id="'.$grid_id.','.$square->id.'"><span class="'.$glyph.'"></span></button>';
          $html .= form_close();
          $col = 1; 
        }
      }
      $html .='      </div>';
    
      $odds = (1 / (1 / ($nb_squares - $nb_failed)))*0.99;
    
      $html .='    </div>';
      $html .='    <div class="col-md-9">';
      $html .='      <p>Grid id : '.$grid_id.'.</p>';
      $html .='      <p>Failed attempts : '.$nb_failed.'.</p>';
      $html .='      <p>Odds of the next attempt is '.$odds;
      $html .='    </div>';
      $html .='  </div>';
      
      log_message('debug', 'grid produced with hmtl :'.$html);
      
      return $html;
    }

}