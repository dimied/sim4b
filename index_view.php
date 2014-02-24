<!DOCTYPE HTML>
<html>
    <meta charset="utf-8">
    <head>
        <title>Test page</title>
        <?php
        parseDataArray($css_data);
        ?>
<!--        <script type = "text/javascript">
            //Patches for older browsers
            //
            //array patch
            if (typeof Array.isArray !== 'function') {
                Array.isArray = function(value) {
                    return Object.prototype.toString.apply(value) === '[object Array]';
                };
            }
        </script>-->
        <?php
        parseDataArray($js_head_data);
        echo "\n";
        ?>
    </head>
    <body>
        <noscript>
        <div style="z-index: 200; position: absolute; top:0; left:5%;background-color: #FF2552;">
            <h2>Um diese Seite auch sinnvoll nutzen zu können schalten Sie bitte JavaScript wieder ein.</h2>
        </div>
        </noscript>
        <div id="editorarea" >
            <img src="<?php echo $img_data ?>"  id="real_image" width="1280" height="1024" alt="some image" style="position: absolute; left:0; top:0;">
            <div id="canvaseditor_div">
                <canvas id="canvaseditor" style="z-index:15">
                </canvas>
                <canvas id="canvaseditor_clipper" style="z-index:20" width="2" height="2">
                </canvas>
            </div>
        </div>

        <div id="fileselector" style="bottom:0; left:50%; width:200px;">
            <form id="fileselector_form" action="index.php?action=upload" method="post"  enctype="multipart/form-data">
                <!-- maxlength="50000000" -->
                <input name="file" type="file" id="upload_filename" accept="image/*" onchange=""/><br>
                <input name="upload" value="Upload" type="button" onclick="" />
                <input name="abort" value="Abbrechen" type="button" onclick="" />
            </form>
            <br>
            <div id="default_fileupload_widget">
                <div id="default_fileupload_widget_fileName"></div>
                <div id="default_fileupload_widget_fileSize"></div>
                <div id="default_fileupload_widget_fileType"></div>
                <span id="default_fileupload_widget_progress_procent"></span>
                <progress id="default_fileupload_widget_progressbar" value="0"></progress> 
            </div>

        </div>

        <div  id="savedialog" style="position:absolute; right:0; bottom:0;">
            <div id="save_dialog_title" class="sim_title" style="padding: 2px; border-width: 2px; border-style: dotted; border-color: blue;">Saver
            </div>
            <div style="padding:4px; clear:both;">
                <form>
                    <input type="text" id="filename" size="10" value="schnitt">
                    <!--                <span id="filename_ext">.png</span>-->
                    <br>

                    <a href="#" id="saveimage_png" dowload="someimage" >Save as PNG</a>
                    <br>
                    <a href="#" id="saveimage_jpg" dowload="someimage">Save as JPEG</a>
                    <br>
                    <a href="#" id="saveimage_bmp" dowload="someimage">Save as BMP</a>
                    <br>

                </form>
            </div>
        </div>
        <div id="info_widget" >
            <div class="sim_title" style="padding: 2px; border-width: 2px; border-style: dotted; border-color: blue;">Info
                <div style="text-align: right; margin-left: 10; padding-left: 10;float:right;">
                    |<a hre="#" id="open_info">Open</a>|<a hre="#" id="close_info">Close</a>
                </div>
            </div>
            <div id="info_content" style="clear:right;">
                <div class="img_desc">
                    <div style="padding-right:20px;">Bild</div>
                    <div class="img_info">
                        <table>
                            <tr><td class="info_name">Breite:</td><td id="orig_image_width"></td></tr>
                            <tr><td class="info_name">H&ouml;he:</td><td id="orig_image_height"></td></tr>
                        </table>
                    </div>
                </div>
                <div class="img_desc">
                    <div style="padding-right:20px;">Beschnittbereich (sichtbar)</div>
                    <div class="img_info">
                        <table>
                            <tr><td class="info_name">x:</td><td id="clip_image_x"></td></tr>
                            <tr><td class="info_name">y:</td><td id="clip_image_y"></td></tr>
                            <tr><td class="info_name">Breite:</td><td id="clip_image_width"></td></tr>
                            <tr><td class="info_name">H&ouml;he:</td><td id="clip_image_height"></td></tr>
                        </table>
                    </div>
                </div>
                <div class="img_desc">
                    <div style="padding-right:20px;">Beschnittbereich (real)</div>
                    <div class="img_info">
                        <table>
                            <tr><td class="info_name">x:</td><td id="real_clip_image_x"></td></tr>
                            <tr><td class="info_name">y:</td><td id="real_clip_image_y"></td></tr>
                            <tr><td class="info_name">Breite:</td><td id="real_clip_image_width"></td></tr>
                            <tr><td class="info_name">H&ouml;he:</td><td id="real_clip_image_height"></td></tr>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <div id="maineditor">

            <?php
            try {
                if ($content) {
                    echo "Content given;";
                    if (is_array($content)) {
                        foreach ($content as $content_part) {
                            echo $content_part;
                        }
                    } else {
                        echo $content;
                    }
                }
            } catch (Exception $e) {
                //content may be not given.
            }
//            echo "<br>URI:";
//            echo $_SERVER["REQUEST_URI"];
//            echo "<br>QUERY:";
//            echo $_SERVER['QUERY_STRING'];
            ?>

        </div>
        <?php
        if ($debug_stuff) {
            echo '<div id="debug">';
            echo $debug_stuff;
            echo "</div>";
        }
        ?>

        <?php
        parseDataArray($js_body_bottom_data);
        ?>

    </body>
</html>
