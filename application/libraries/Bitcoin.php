<?php  if ( ! defined('BASEPATH')) exit('No direct script access allowed');

/*
* Pour gérer les paiments.
*
*/
class Bitcoin  {

  private $site_address = '1Pobz3tfkcASMg1X7CfMadaerm8kqimNhX';
  private $root_url = 'https://blockchain.info/api/receive';

  public function create_address($callback_url)
  { 
    $parameters = 'method=create&address=' . $site_address .'&callback='. urlencode($callback_url);  
    $response = file_get_contents($root_url . '?' . $parameters);
    if ($response = "Error Generating Receiving Address")
    {
      $new_address = FALSE;
    }
    else
    {
      $object = json_decode($response);
      $new_address = $object->input_address;
    }
    return $new_address;
  }
  
  public function receive_payment()
  {
  
  }
  
  public function transfer_money($address, $amount, $fee=0)
  {
  
  }
  
  

}         