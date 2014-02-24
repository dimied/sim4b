<?php

namespace Module;

/**
 * Class for Simple Image Manipulator
 */
class SIM extends SimpleModule {

    const CONFIG_PRODUCTION_PATHS = "production_paths";

    protected $js_dev_path = "./SIM/js/";
    protected $css_dev_path = "./SIM/css/";
    protected $img_dev_path = "./SIM/img/";
    protected $production_paths;
    protected $image_modifier;

    public function __construct() {
        //
    }

    public function loadConfig($config) {
        if (is_array($config)) {
            if (isset($config["production_paths"])) {
                $this->production_paths = $config["production_paths"];
            }
            return TRUE;
        }
        return FALSE;
    }

    public function applyActions($actionArray, $callback = NULL) {
        if (is_array($actionArray) && ($actionArray) > 0) {
            $appliedActions = array();
            foreach ($actionArray as $actionDesc) {
                if (is_array($actionDesc)) {
                    
                }
            }
            return $appliedActions;
        }
        return NULL;
    }

    public function loadImage($path) {
        $this->image_modifier = Module\ImageModifierFactory::fromPath($path);
        return ( isset($this->image_modifier) );
    }

    public function cropImage($x, $y, $width, $height) {
        if (isset($this->image_modifier)) {
            $img = $this->image_modifier->getRessource();
            return $this->image_modifier->cropImage($img, $x, $y, $width, $height);
        }
        return NULL;
    }

    public function scaleImage($xScale, $yScale = NULL) {
        if (isset($this->image_modifier)) {
            $img = $this->image_modifier->getRessource();
            return $this->image_modifier->scaleImage($img, $xScale, $yScale);
        }
        return NULL;
    }

    public function rotateImage($radians, $clockwise = TRUE) {
        if (isset($this->image_modifier)) {
            $img = $this->image_modifier->getRessource();
            return $this->image_modifier->rotateImage($img, $radians, $clockwise);
        }
        return NULL;
    }
}

?>
