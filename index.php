<?php

error_reporting(E_ALL);
ini_set('display_errors', '1');

require_once("autoloader.php");

function parseDataArray($arr) {

    if (is_array($arr)) {
        foreach ($arr as $data) {
            if (!is_array($data)) {
                continue;
            }
            $type = NULL;
            $method = NULL;
            $startTag = "";
            $endTag = "";
            $inline = FALSE;

            if (is_string($data["type"]) && is_string($data["method"])) {
                $type = strtolower($data["type"]);
                $method = strtolower($data["method"]);
            }

            $path = isset($data["path"]) && is_string($data["path"]) ? $data["path"] : "";

            if (($type === "js") || ($type === "jscript") || ($type === "javascript")) {
                $endTag = "</script>";

                if ($method === "link") {
                    $startTag = '<script src="' . $path . '" type="text/javascript">';
                } else {
                    $startTag = '<script type="text/javascript">';
                    $inline = TRUE;
                }
            } else if ($type === "css") {
                if ($method === "link") {
                    $startTag = '<link rel="stylesheet" href="' . $path . '" >';
                } else {
                    $startTag = "<style>";
                    $endTag = "</style>";
                    $inline = TRUE;
                }
            }

            if ($startTag) {
                echo $startTag;
                if ($inline && isset($data["data"]) && is_string($data["data"])) {
                    echo "\n";
                    echo $data["data"];
                    echo "\n";
                }
                if ($endTag) {
                    echo $endTag;
                    echo "\n";
                }
            }
        }
    }
}

class FrontController {

    protected $view_template_path = "index_view.php";
    protected $empty_page_content = "Empty page";
    protected $basic_error_message = "Some server error";
    protected $css_data;
    protected $js_head_data;
    protected $js_body_bottom_data;

    protected function getHeadCSS() {
        return $this->css_data;
    }

    protected function getHeadJavaScript() {
        return $this->js_head_data;
    }

    protected function getBodyBottomJavaScript() {
        return $this->js_body_bottom_data;
    }

    protected function getBodyBottomInlineData() {
        $fname = "./js/window.js";
        $data = "";
        if (file_exists($fname)) {
            $f = fopen($fname, "r");
            $size = filesize($fname);
            $data = ($size > 0) ? fread($f, $size) : "";
            fclose($f);
        }
        return $data;
    }

    protected function prepareIndexContent() {
        $config = \Module\Config::getInstance();

        $simib = new \Module\SIM();

        $configArr = $config->getConfigArray("SIM");
        $simib->loadConfig($configArr);

        $this->css_data = array();
        $this->css_data[] = array("type" => "css", "method" => "inline", "path" => "./css/head.css");

        $this->js_head_data = array();
        $this->js_head_data[] = array("type" => "js", "method" => "link", "path" => "./js/window.js");
        $this->js_head_data[] = array("type" => "js", "method" => "link", "path" => "./js/clip.js");

        $this->js_body_bottom_data = array();
        $this->js_body_bottom_data[] = array("type" => "js", "method" => "inline", "path" => "./js/bottom.js");
        //$this->js_body_bottom_data[] = array("type" => "js", "method" => "inline", "path" => "./js/divmove.js");

        return "";
    }

    protected static function fillInlineData($arr) {
        if (is_array($arr)) {
            $newArr = array();
            foreach ($arr as $data) {
                if (is_array($data) && isset($data["method"]) && isset($data["path"]) &&
                        $data["method"] === "inline" && is_string($data["path"])) {
                    if (file_exists($data["path"])) {
                        $size = filesize($data["path"]);
                        if ($size > 0) {
                            $f = fopen($data["path"], "r");
                            $content = fread($f, $size);
                            fclose($f);
                            $data["data"] = $content;
                        }
                    }
                }
                $newArr[] = $data;
            }
            return $newArr;
        }
        return $arr;
    }

    public function upload() {
        $debug_stuff = "UPLOADING";
        $this->index($debug_stuff);
    }

    public function index($data = "") {

        $view = $this->empty_page_content;

        if (is_string($this->view_template_path) && file_exists($this->view_template_path)) {
            try {
                ob_start();
                $content = $this->prepareIndexContent();
                $css_data = $this->getHeadCSS();
                $css_data = self::fillInlineData($css_data);

                $js_head_data = $this->getHeadJavaScript();
                $js_head_data = self::fillInlineData($js_head_data);

                $js_body_bottom_data = $this->getBodyBottomJavaScript();
                $js_body_bottom_data = self::fillInlineData($js_body_bottom_data);

                $content .= "Memory: " . memory_get_usage();
                $debug_stuff = $data;
                $debug_stuff .= ob_get_clean();
                $content .= $debug_stuff;
                $img_data = "foto.png";
                ob_start();
                include($this->view_template_path);
                $view = ob_get_clean();
            } catch (Exception $e) {
                echo $e;
                $view = $this->basic_error_message;
            }
        } else {
            $view = $this->basic_error_message;
        }
        $view .= "<!--Memory: " . memory_get_usage() . " -->";
        return $view;
    }

}

//function parseQueryString($query_string) {
//    if (count($query_string) > 0) {
//        $parts = explode("&", $query_string);
//        $parameters = array();
//        foreach ($parts as $query_part) {
//            if (count($query_part) > 0) {
//                $param_pair = explode(" = ", $query_part);
//                if (count($param_pair) == 2) {
//                    $parameters[$param_pair[0]] = $param_pair[1];
//                }
//            }
//        }
//        return $parameters;
//    }
//    return array();
//}

function mainAction() {

//    $currentURI = $_SERVER["REQUEST_URI"];
//    $currentQueryString = $_SERVER['QUERY_STRING'];

    $main = new FrontController();
    $actionName = "index";
    $givenAction = filter_input(INPUT_SERVER, 'action', FILTER_SANITIZE_SPECIAL_CHARS);
    if (is_string($givenAction) && method_exists($main, $givenAction)) {
        $actionName = $givenAction;
    }
    echo $main->$actionName();
}

/*
  RewriteEngine on
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteRule . index.php [L]
 */
mainAction();
?>
