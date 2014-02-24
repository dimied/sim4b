<?php

namespace Module;

class ImageModifierFactory {

    protected function __construct($img) {
    }

    public static function fromPath($path) {
        return Module\ImageModifiers\ImageModifierGD::fromPath($path);
    }

    public static function fromRessource($res) {
        return Module\ImageModifiers\ImageModifierGD::fromRessource($res);
    }
}
