# School Database Design

## Table Explanations & Relationships
* **`students`**: Stores core information about the person (name, email).
* **`courses`**: Stores information about the subjects being taught (title).
* **`enrolments`**: The **join table** that acts as the bridge between students and courses. It also holds the "grade," which is a fact that belongs to the *relationship itself*, not solely to the student or the course.

**The Relationships:**
A single student can take many courses (One-to-Many), and a single course can hold many students (One-to-Many). Combined, this forms a **Many-to-Many** relationship. A join table (`enrolments`) is absolutely required because relational databases cannot store arrays inside a single column. The join table resolves the Many-to-Many relationship by creating two One-to-Many relationships pointing at the bridge.

## Indexing Strategy
I would add an index on the course title:
`CREATE INDEX idx_courses_title ON courses(title);`
**Reason:** The system frequently looks up course rosters by the name of the course (`WHERE courses.title = 'Computer Science'`). Without an index, the database must perform a full table scan of all courses. With the index, it instantly finds the exact course ID to pass to the `JOIN`. (Note: The `students` and `courses` ID columns, the `email` column, and the `enrolments` composite key are already automatically indexed by their `PRIMARY KEY` and `UNIQUE` constraints).

## SQL vs NoSQL Paradigm
For a school system, **SQL is the undeniably correct choice**. Educational records require rigid structure and absolute correctness. If a student's name or email changes, normalization ensures it is updated in exactly one place. If this were a NoSQL document database, related data might be embedded (e.g., student documents holding arrays of their courses), meaning a change to a course title would require updating every single student's document who is enrolled in it—risking corrupted, inconsistent data. Furthermore, school operations (like calculating GPAs or processing tuition) rely heavily on the ACID transaction guarantees provided by relational SQL databases.