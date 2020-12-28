<?php
 
if($_POST) {
    $visitor_name = "";
    $visitor_email = "";
    $email_title = "";
    $visitor_message = "";
    $visitor_lang = "";
     
    if(isset($_POST['visitor_name'])) {
      $visitor_name = filter_var($_POST['visitor_name'], FILTER_SANITIZE_STRING);
    }
     
    if(isset($_POST['visitor_email'])) {
        $visitor_email = str_replace(array("\r", "\n", "%0a", "%0d"), '', $_POST['visitor_email']);
        $visitor_email = filter_var($visitor_email, FILTER_VALIDATE_EMAIL);
    }
     
    if(isset($_POST['email_title'])) {
        $email_title = filter_var($_POST['email_title'], FILTER_SANITIZE_STRING);
    }
     
   
     
    if(isset($_POST['visitor_message'])) {
        $visitor_message = htmlspecialchars($_POST['visitor_message']);
    }
     
     
      if(isset($_POST['visitor_lang'])) {
        $visitor_lang = htmlspecialchars($_POST['visitor_lang']);
    }
  
    $recipient = "info@dasaki.com";
   
     
    $headers  = 'MIME-Version: 1.0' . "\r\n"
    .'Content-type: text/html; charset=utf-8' . "\r\n"
    .'From: ' . $visitor_email . "\r\n";
     
    if(mail($recipient, $email_title, $visitor_message, $headers)) {
        if ($visitor_lang == 'en')
            echo "<p>Thank you for contacting us, $visitor_name.</p>";
        else 
          echo "<p>Gracias por contactarnos, $visitor_name.</p>";
    } else {
        if ($visitor_lang == 'en')
           echo '<p>We are sorry but the message did not go through.</p>';
        else
           echo '<p>Lo sentimos pero no se ha podido enviar el mensaje.</p>';
    }
     
} else {
    echo '<p>Something went wrong</p>';
}
 