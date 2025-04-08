-- Drop existing tables if they exist
DROP TABLE IF EXISTS results;
DROP TABLE IF EXISTS questions;
DROP TABLE IF EXISTS games;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

.mode column
.header on

-- Create users table
CREATE TABLE users (
    userid TEXT PRIMARY KEY, 
    password TEXT NOT NULL, 
    role TEXT CHECK(role IN ('admin', 'guest')) NOT NULL
);

-- Create categories table
CREATE TABLE categories (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT CHECK(length(color) = 7) -- hex color e.g. "#FF5733"
);

-- Create games table
CREATE TABLE games (
    gameid INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    category_id INTEGER NOT NULL,
    author_id TEXT NOT NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (author_id) REFERENCES users(userid)
);

-- Create questions table
CREATE TABLE questions (
    questionid INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id INTEGER NOT NULL,
    type TEXT CHECK(type IN ('multiselect', 'type', 'num', 'truefalse')) NOT NULL,
    question TEXT NOT NULL,
    correct TEXT NOT NULL,
    option1 TEXT,
    option2 TEXT,
    option3 TEXT,
    FOREIGN KEY (game_id) REFERENCES games(gameid)
);

-- Create results table
CREATE TABLE results (
    resultid INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    game_id INTEGER NOT NULL,
    result_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    correct_answers INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(userid),
    FOREIGN KEY (game_id) REFERENCES games(gameid)
);

-- Sample data

-- Users
INSERT INTO users (userid, password, role) VALUES 
('admin1', 'adminpass', 'admin'),
('guest1', 'guestpass', 'guest'),
('guest2', 'guestpass2', 'guest');

-- Categories
INSERT INTO categories (id, name, color) VALUES
(17, 'Science',           '#2ecc71'),
(19, 'Math',              '#f39c12'),
(12, 'Music',             '#3498db'),
(25, 'Art',               '#e91e63'),
(23, 'History',           '#8e44ad'),
(24, 'Politics',          '#c0392b'),
(22, 'Geography',         '#16a085'),
(9,  'General Knowledge', '#7f8c8d');


-- Games
INSERT INTO games (title, description, category_id, author_id) VALUES
('Basic Science Quiz', 'Test your general science knowledge!', 1, 'admin1'),
('World History', 'A journey through global events.', 2, 'admin1'),
('Movie Trivia', 'Guess the movie facts.', 3, 'admin1');

-- Questions
INSERT INTO questions (game_id, type, question, correct, option1, option2, option3) VALUES
(1, 'truefalse', 'The Earth revolves around the Sun.', 'true', NULL, NULL, NULL),
(1, 'num', 'How many legs does a spider have?', '8', NULL, NULL, NULL),
(2, 'multiselect', 'Who were allies in WW2?', 'USA;UK;USSR', 'USA', 'Germany', 'USSR'),
(3, 'type', 'Who directed *Titanic*?', 'James Cameron', NULL, NULL, NULL);

-- Results
INSERT INTO results (user_id, game_id, correct_answers) VALUES
('guest1', 1, 2),
('guest2', 2, 1),
('guest1', 3, 1);
