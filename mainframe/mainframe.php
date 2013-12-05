<?php
session_start();

echo '{"username":"'.$_SESSION["user"]["user_name"].'"}';
// echo '{"username":"me"}';