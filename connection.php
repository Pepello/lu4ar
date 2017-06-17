<?php

$servername = 'localhost';
$username = 'lu4r';
$password = 'lu4r';
$dbname = 'lu4r';

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
// Check connection
if ($conn->connect_error) {
    die('Connection failed: ' . $conn->connect_error);
}
