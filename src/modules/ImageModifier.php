<?php

namespace Module;

interface ImageModifier {
    
    public function isExtensionSupported($ext);
    
    public function getSupportedMimeTypesRead();
    
    public function getSupportedMimeTypesWrite();
    
    public function getRessource();
    
    public function cropImage($img, $x, $y, $width, $height);

    public function scaleImage($img, $xScale, $yScale = NULL);

    public function rotateImage($img, $radians, $clockwise=TRUE);
    
    public function saveAs($filepath);
    
    public function getImageAsString();
}

?>
