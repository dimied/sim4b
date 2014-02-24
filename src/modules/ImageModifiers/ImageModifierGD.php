<?php

namespace Module\ImageModifiers;

//if (!function_exists("imagecrop") && FALSE) {
//
//    function imagecrop($img, $params) {
//        $cropped = imagecreatetruecolor($width, $height);
//        imagecopy($cropped, $img, 0, 0, $x, $y, $width, $height);
//        return $cropped;
//    }
//
//}

class ImageModifierGD implements Module\ImageModifier {

    protected $config;
    protected $img;

    protected function __construct($img) {
        $this->img = $res;

        if (!function_exists("imagecrop")) {
            $this->cropImage = function($img, $x, $y, $width, $height) {
                $cropped = imagecreatetruecolor($width, $height);
                imagecopy($cropped, $img, 0, 0, $x, $y, $width, $height);
                return $cropped;
            };
        }
    }

    public static function fromPath($path) {
        
    }

    public static function fromRessource($res) {
        $obj = new ImageModifierGD($res);
        return $obj;
    }

    public function getRessource() {
        return $this->img;
    }

    public function cropImage($img, $x, $y, $width, $height) {
        $params = array("x" => $x, "y" => $x, "width" => $width, "height" => $height);
        return imagecrop($img, $params);
    }

    public function scaleImage($img, $newWidth, $newHeight = NULL) {
        $width = imagesx($img);
        $height = imagesy($img);
        
        $byWidth = is_null($newWidth);
        $byHeight = is_null($newHeight);
        
        if ($byHeight && $byHeight) {
            return $img;
        }
        
        //by ratio ?
        if ($byWidth || $byHeight) {
            $ratio_orig = $width / $height;
            if ($byWidth) {
                $newHeight = $height * $ratio_orig;
            } else {
                $newWidth = $width / $ratio_orig;
            }
        }

        $dst_image = imagecreatetruecolor($newWidth, $newHeight);
        imagecopyresampled($dst_image, $img, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);

        return $dst_image;
    }

    public function rotateImage($img, $angle, $clockwise = TRUE) {
        if (!$clockwise) {
            $angle = -$angle;
        }
        return imagerotate($img, $angle, 0);
    }

    public function isExtensionSupported($ext) {
        
    }

    public function getSupportedMimeTypesRead() {
        return ImageSupportGD::getSupportedMimeTypesRead();
    }

    public function getSupportedMimeTypesWrite() {
        return ImageSupportGD::getSupportedMimeTypesWrite();
    }

    public function saveAs($filepath) {
        
    }

    public function getImageAsString() {
        
    }

}
