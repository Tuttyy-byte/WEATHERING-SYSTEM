<?php
include 'db.php';
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    die(json_encode(["status" => "error", "message" => "Unauthorized"]));
}

$data = json_decode(file_get_contents("php://input"), true);

if (!empty($data['id'])) {
    // Only delete if the student belongs to the logged-in professor
    $stmt = $pdo->prepare("DELETE FROM students WHERE id = ? AND user_id = ?");
    $stmt->execute([$data['id'], $_SESSION['user_id']]);
    
    if ($stmt->rowCount() > 0) {
        echo json_encode(["status" => "success"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Delete failed or record not found"]);
    }
}
?>