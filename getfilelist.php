<?php 

$dir = "./"; //default to root directory

// isset($_GET['directory']) && 
if (strlen($_GET['directory']) > 0){$dir = $_GET['directory'];} else {$dir = "";}
if (strlen($_GET['extension']) > 0){$ext = $_GET['extension'];} else {$ext = "";}
if (strlen($_GET['language']) > 0){$lang = $_GET['language'];} else {$lang = "";}

getListExtension($dir,$ext, $lang);

function getListExtension($theDir, $extension, $language) {
    if (!file_exists($theDir)) {
      print "null";
    }
    $objects = scandir($theDir);
    if ($language == "en") {
      print "<option  value=\"\" disabled selected lang=\"en\">Select</option>";
    }
    else {
      print "<option  value=\"\" disabled selected lang=\"es\">Seleccione</option>";
    }
   
   foreach($objects as $name){
    $filename = pathinfo($name, PATHINFO_FILENAME);
    $ext = pathinfo($name, PATHINFO_EXTENSION);
    if ($ext == $extension) {
      if ($extension == "") {
        
        if (($filename != ".") && ($filename != "..") && ($filename != "")) {
          print "<option value=\"" . $filename . "\">" . $filename . "</option>";
        }
      }
      else {
        
            $filename = pathinfo($name, PATHINFO_FILENAME);
            $path = realpath($theDir);
            $thejpg = $path . "/" . $filename . "_". $language . ".jpg";
            if (file_exists($thejpg)) {
              $xml = simplexml_load_file($path . "/" . $name);
              $attr = $xml->attributes();
              print "<option";
              if ($attr["movement"] != "") { print " value=\"" . $filename . "\">" . $attr["movement"] . "</option>"; }
              else { print " class=\"disabled\" ";
                    print " value=\"" . $filename . "\">" . $filename; 
                  }
              print " </option>";
            }
            else if ($language == "en") {
              print "<option  value=\"none\" lang=\"en\"> NOT AVAILABLE </option>";
            }
            else {
              print "<option  value=\"none\" lang=\"es\"> NO DISPONIBLE </option>";
            }
        }  
      }
    }

}



?>
