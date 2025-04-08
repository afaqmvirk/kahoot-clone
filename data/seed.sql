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
    name TEXT NOT NULL
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
    score INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(userid),
    FOREIGN KEY (game_id) REFERENCES games(gameid)
);

-- Users
INSERT INTO users (userid, password, role) VALUES 
('admin1', 'adminpass', 'admin'),
('guest1', 'guestpass', 'guest'),
('guest2', 'guestpass2', 'guest'),
('guest3', 'guestpass3', 'guest'),
('guest4', 'guestpass4', 'guest');

-- Categories
INSERT INTO categories (id, name) VALUES
(17, 'Science'),
(19, 'Math'),
(12, 'Music'),
(25, 'Art'),
(23, 'History'),
(24, 'Politics'),
(22, 'Geography'),
(9,  'General Knowledge');

-- Games
INSERT INTO games (title, description, category_id, author_id) VALUES
('Basic Science Quiz', 'Test your general science knowledge!', 17, 'admin1'),
('World History', 'A journey through global events.', 23, 'admin1'),
('Movie Trivia', 'Guess the movie facts.', 9, 'admin1');

-- Questions for Science
INSERT INTO questions (game_id, type, question, correct, option1, option2, option3) VALUES
(1, 'truefalse', 'The Earth revolves around the Sun.', 'true', NULL, NULL, NULL),
(1, 'num', 'How many legs does a spider have?', '8', NULL, NULL, NULL),
(1, 'multiselect', 'Which of the following are planets?', 'Earth', 'Sun', 'Earth', 'Moon'),
(1, 'type', 'What gas do plants produce during photosynthesis?', 'Oxygen', NULL, NULL, NULL),
(1, 'truefalse', 'Sound travels faster than light.', 'false', NULL, NULL, NULL);

-- Questions for History
INSERT INTO questions (game_id, type, question, correct, option1, option2, option3) VALUES
(2, 'truefalse', 'The Great Wall of China was built in a single year.', 'false', NULL, NULL, NULL),
(2, 'type', 'Who was the first President of the United States?', 'George Washington', NULL, NULL, NULL),
(2, 'num', 'In what year did WW1 begin?', '1914', NULL, NULL, NULL);

-- Questions for Movie
INSERT INTO questions (game_id, type, question, correct, option1, option2, option3) VALUES
(3, 'type', 'Who directed Titanic?', 'James Cameron', NULL, NULL, NULL),
(3, 'truefalse', 'The movie Inception stars Leonardo DiCaprio.', 'true', NULL, NULL, NULL),
(3, 'multiselect', 'Which of these are Marvel movies?', 'Iron Man', 'Batman', 'Iron Man', 'Superman'),
(3, 'num', 'How many Harry Potter movies are there?', '8', NULL, NULL, NULL);

-- Results
INSERT INTO results (user_id, game_id, score) VALUES
('guest1', 1, 1200),
('guest2', 1, 1500),
('guest3', 1, 700),
('guest4', 1, 900),
('guest1', 2, 1000),
('guest2', 2, 1300),
('guest3', 2, 500),
('guest1', 3, 1800),
('guest2', 3, 1600),
('guest4', 3, 1200);
