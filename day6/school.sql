-- 1. ENABLE FOREIGN KEYS
PRAGMA foreign_keys = ON;

-- 2. CREATE TABLES
CREATE TABLE students (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE
);

CREATE TABLE courses (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL
);

CREATE TABLE enrolments (
  student_id INTEGER NOT NULL,
  course_id INTEGER NOT NULL,
  grade TEXT,
  PRIMARY KEY (student_id, course_id), -- Prevents duplicate enrolments
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- 3. INSERT SAMPLE DATA
INSERT INTO students (name, email) VALUES 
  ('Alice Johnson', 'alice@example.com'),
  ('Bob Smith', 'bob@example.com'),
  ('Charlie Davis', 'charlie@example.com'),
  ('David Wilson', 'david@example.com'); -- David will have no enrolments

INSERT INTO courses (title) VALUES 
  ('Mathematics'),
  ('Computer Science'),
  ('World History');

INSERT INTO enrolments (student_id, course_id, grade) VALUES 
  (1, 1, 'A'), -- Alice in Math
  (1, 2, 'B'), -- Alice in Computer Science
  (2, 2, 'A'), -- Bob in Computer Science
  (2, 3, 'C'), -- Bob in World History
  (3, 1, 'B'); -- Charlie in Math

-- 4. REQUIRED QUERIES

-- Query 1: All courses for one student (by name)
SELECT courses.title, enrolments.grade
FROM courses
JOIN enrolments ON courses.id = enrolments.course_id
JOIN students ON students.id = enrolments.student_id
WHERE students.name = 'Alice Johnson';

-- Query 2: All students on one course (by name)
SELECT students.name, enrolments.grade
FROM students
JOIN enrolments ON students.id = enrolments.student_id
JOIN courses ON courses.id = enrolments.course_id
WHERE courses.title = 'Computer Science';

-- Query 3: The number of students per course
SELECT courses.title, COUNT(enrolments.student_id) AS student_count
FROM courses
LEFT JOIN enrolments ON courses.id = enrolments.course_id
GROUP BY courses.id;

-- Query 4: Students who have no enrolments
SELECT students.name 
FROM students
LEFT JOIN enrolments ON students.id = enrolments.student_id
WHERE enrolments.course_id IS NULL;

-- Query 5: Update one enrolment's grade
UPDATE enrolments 
SET grade = 'A+' 
WHERE student_id = 1 AND course_id = 1; -- Updates Alice's Math grade