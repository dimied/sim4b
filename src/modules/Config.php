<?php

namespace Module;

class Config {

    protected $config_folder_path = "/../../config";
    protected $main_config_filename = "config.json";
    protected $all_configs;

    protected function hasExtension($path, $ext) {
        return (pathinfo($path, PATHINFO_EXTENSION) === $ext);
    }

    protected function jsonFileToArray($path) {
        $f = fopen($path, "r");
        $size = filesize($path);
        $content = ($size > 0) ? fread($f, $size) : "";
        fclose($f);
        if (count($content) > 0) {
            $content = \json_decode($content, TRUE);
            return $content;
        }
        return NULL;
    }

    protected function readConfigFile($path) {
        if ($this->hasExtension($path, "json")) {
            return $this->jsonFileToArray($path);
        }
        return NULL;
    }

    protected function getFilename($path) {
        return pathinfo($path, PATHINFO_FILENAME);
    }

    protected function allFilenames($path) {
        $filenames = array();
        $entries = scandir($path);

        if (is_array($entries)) {
            foreach ($entries as $fileOrDir) {
                $full_path = $path . "/" . $fileOrDir;
                if (!is_dir($full_path)) {
                    $filenames[] = $full_path;
                }
            }
        }
        return $filenames;
    }

    protected function assignFileContent($content, $file) {
        $filename = $this->getFilename($file);
        if ($filename === $this->main_config_filename) {

            if (count($content) > 0) {
                foreach ($content as $key => $value) {
                    $modulename = strtolower($key);
                    $this->assignConfigFromMain($modulename, $value);
                }
            }
        } else {
            $modulename = strtolower($filename);
            $this->assignConfigFromMain($modulename, $content);
        }
    }

    protected function assignConfigFromMain($modulename, $content) {
        if (!isset($this->all_configs[$modulename])) {
            $this->assignConfig($modulename, $content);
        }
    }

    protected function assignConfig($modulename, $content) {
        $this->all_configs[$modulename] = $content;
    }

    public function getConfigArray($modulename) {
        if (is_array($this->all_configs)) {
            $key = strtolower($modulename);

            if (isset($this->all_configs[$key])) {
                return $this->all_configs[$key];
            }
        }
        return NULL;
    }

    public function __construct() {
        $this->config_folder_path = __DIR__ . $this->config_folder_path;

        $file_paths = $this->allFilenames($this->config_folder_path);

        foreach ($file_paths as $file) {
            $content = $this->readConfigFile($file);
            $this->assignFileContent($content, $file);
        }
    }

    public function getInstance() {
        return new Config();
    }

}
