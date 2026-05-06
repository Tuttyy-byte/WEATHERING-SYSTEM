<?php
include 'db.php';
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) exit(json_encode([]));

$stmt = $pdo->prepare("SELECT * FROM students WHERE user_id = ? ORDER BY id DESC");
$stmt->execute([$_SESSION['user_id']]);
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
?>