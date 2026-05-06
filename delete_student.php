<?php
include 'db.php';
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) exit();
$data = json_decode(file_get_contents("php://input"), true);

$stmt = $pdo->prepare("DELETE FROM students WHERE id = ? AND user_id = ?");
$stmt->execute([$data['id'], $_SESSION['user_id']]);
echo json_encode(["status" => "success"]);
?>