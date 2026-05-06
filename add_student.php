<?php
include 'db.php';
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) exit();
$data = json_decode(file_get_contents("php://input"), true);

if (!empty($data['name']) && !empty($data['course'])) {
    $stmt = $pdo->prepare("INSERT INTO students (user_id, name, course, percentage) VALUES (?, ?, ?, ?)");
    $stmt->execute([$_SESSION['user_id'], $data['name'], $data['course'], $data['percentage']]);
    echo json_encode(["status" => "success"]);
}
?>