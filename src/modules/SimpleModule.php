<?php

namespace Module;

/**
 * Describes basic functionality of many
 */
abstract class SimpleModule {

    /**
     * 
     */
    protected function getHeadCSS($forceInline) {
        return "";
    }

    /**
     * 
     */
    protected function getHTML() {
        return "";
    }

    /**
     * 
     */
    protected function getHeadJavaScript($forceInline) {
        return "";
    }

    /**
     * 
     */
    protected function getBodyBottomJavaScript($forceInline) {
        return "";
    }

    /**
     * 
     */
    public function loadConfig($config) {
        return TRUE;
    }

}

?>
