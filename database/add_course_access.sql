-- Migration: add_course_access
-- Creates the course_access table for granting free access to paid courses

USE brvm_education;

CREATE TABLE IF NOT EXISTS course_access (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  course_id INT NOT NULL,
  granted_by INT NOT NULL,
  granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL,
  note VARCHAR(500) NULL,
  UNIQUE KEY unique_user_course (user_id, course_id),
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);
