<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';

$conn = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];

// Use teacher_id = 1 (teacher1 user)
$teacher_id = 1;

switch ($method) {
    case 'GET':
        // Get all classes or a specific class
        if (isset($_GET['id'])) {
            $id = intval($_GET['id']);
            $stmt = $conn->prepare("SELECT * FROM classes WHERE id = ? AND teacher_id = ?");
            $stmt->bind_param("ii", $id, $teacher_id);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows > 0) {
                echo json_encode($result->fetch_assoc());
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Class not found']);
            }
        } else {
            $stmt = $conn->prepare("SELECT * FROM classes WHERE teacher_id = ? ORDER BY created_at DESC");
            $stmt->bind_param("i", $teacher_id);
            $stmt->execute();
            $result = $stmt->get_result();
            
            $classes = [];
            while ($row = $result->fetch_assoc()) {
                $classes[] = $row;
            }
            echo json_encode($classes);
        }
        break;
        
    case 'POST':
        // Create a new class for teacher_id = 1
        $data = json_decode(file_get_contents('php://input'), true);
        
        $name = $data['name'] ?? '';
        $subject = $data['subject'] ?? null;
        $year = $data['year'] ?? null;
        
        if (empty($name)) {
            http_response_code(400);
            echo json_encode(['error' => 'Class name is required']);
            exit();
        }
        
        $stmt = $conn->prepare("INSERT INTO classes (teacher_id, name, subject, year) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("issi", $teacher_id, $name, $subject, $year);
        
        if ($stmt->execute()) {
            $new_id = $conn->insert_id;
            $stmt = $conn->prepare("SELECT * FROM classes WHERE id = ?");
            $stmt->bind_param("i", $new_id);
            $stmt->execute();
            $result = $stmt->get_result();
            echo json_encode($result->fetch_assoc());
        } else {
            http_response_code(500);
            $error_msg = $stmt->error ? $stmt->error : 'Unknown database error';
            echo json_encode(['error' => 'Failed to create class: ' . $error_msg]);
        }
        break;
        
    case 'PUT':
        // Update a class
        $data = json_decode(file_get_contents('php://input'), true);
        $id = intval($data['id'] ?? 0);
        
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'Class ID is required']);
            exit();
        }
        
        $name = $data['name'] ?? '';
        $subject = $data['subject'] ?? null;
        $year = $data['year'] ?? null;
        
        if (empty($name)) {
            http_response_code(400);
            echo json_encode(['error' => 'Class name is required']);
            exit();
        }
        
        $stmt = $conn->prepare("UPDATE classes SET name = ?, subject = ?, year = ? WHERE id = ? AND teacher_id = ?");
        $stmt->bind_param("ssiii", $name, $subject, $year, $id, $teacher_id);
        
        if ($stmt->execute()) {
            $stmt = $conn->prepare("SELECT * FROM classes WHERE id = ?");
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $result = $stmt->get_result();
            echo json_encode($result->fetch_assoc());
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update class']);
        }
        break;
        
    case 'DELETE':
        // Delete a class
        $id = intval($_GET['id'] ?? 0);
        
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'Class ID is required']);
            exit();
        }
        
        $stmt = $conn->prepare("DELETE FROM classes WHERE id = ? AND teacher_id = ?");
        $stmt->bind_param("ii", $id, $teacher_id);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Class deleted successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete class']);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}

$conn->close();
?>

