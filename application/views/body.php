
  <!-- Begin page content -->
  <div class="container">
    <div class="page-header">
      <h1>List of active grids</h1>
    </div>
    <?php
    if (isset($squaresx2))
    {
      foreach ($squaresx2 as $squares)
      {
        echo produce_grid($squares);
      }
    }
    if (isset($squaresx3))
    {
      foreach ($squaresx3 as $squares)
      {
        echo produce_grid($squares);
      }
    }
    if (isset($squaresx4))
    {
      foreach ($squaresx4 as $squares)
      {
        echo produce_grid($squares);
      }
    }
    ?>  
  </div>
</div>
