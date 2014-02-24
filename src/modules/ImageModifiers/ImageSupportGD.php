<?php


class ImageSupportGD {

    protected static $supportMap = array(
        "GIF Read Support" => array("mime" => "image/gif", "read" => TRUE),
        IMAGETYPE_GIF => "GIF Read Support",
        "GIF Create Support" => array("mime" => "image/gif", "write" => TRUE),
        "JPG Support" => "JPEG Support",
        "JPEG Support" => array("mime" => "image/jpeg", "rw" => TRUE),
        "PNG Support" => array("mime" => "image/png", "rw" => TRUE),
        "WBMP Support" => array("mime" => "image/bmp", "rw" => TRUE),
        "XBM Support" => array("mime" => "image/xbm", "rw" => TRUE),
        "WebP Support" => array("mime" => "image/webp", "rw" => TRUE)
    );
    
    protected static function parseMapEntry($key, $value, &$readArr, &$writeArr) {
        
    }

    protected static function initSupportedTypes() {
        $readable_mime_types = array();
        $writable_mime_types = array();
        $seen = array();
        $info = gd_info();

        foreach (self::$supportMap as $key => $value) {
            self::parseMapEntry($key, $value, $readable_mime_types, $writable_mime_types);
            
            if (!is_string($key) || (is_string($key) && is_string($value))) {
                $key = $value;
                if (!isset(self::$supportMap[$key])) {
                    continue;
                }
                continue;
            }
            if (is_string($key) && is_array($value) && isset($value["mime"])) {
                $mimeType = $value["mime"];
                if (isset($value["rw"]) && $value["rw"]) {
                    $readable_mime_types[] = $mimeType;
                    $writable_mime_types[] = $mimeType;
                    continue;
                }
                if (isset($value["read"]) && $value["read"]) {
                    $readable_mime_types[] = $mimeType;
                }
                if (isset($value["write"]) && $value["write"]) {
                    $writable_mime_types[] = $mimeType;
                }
            }
        }
        self::$readable_mime_types = array_unique($readable_mime_types);
        self::$writable_mime_types = array_unique($writable_mime_types);
    }

    protected function __construct($param) {
        
    }

    public static function getSupportedMimeTypesRead() {
        if (!is_array(self::$readable_mime_types)) {
            self::initSupportedTypes();
        }
        return self::$readable_mime_types;
    }

    public static function getSupportedMimeTypesWrite() {
        if (!is_array(self::$writable_mime_types)) {
            self::initSupportedTypes();
        }
        return self::$writable_mime_types;
    }
}
