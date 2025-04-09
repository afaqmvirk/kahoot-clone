DROP TABLE IF EXISTS results;
DROP TABLE IF EXISTS questions;
DROP TABLE IF EXISTS games;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

.mode column
.header on

CREATE TABLE users (
    userid TEXT PRIMARY KEY, 
    password TEXT NOT NULL, 
    role TEXT CHECK(role IN ('admin', 'guest')) NOT NULL
);

CREATE TABLE categories (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE games (
    gameid INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    category_id INTEGER NOT NULL,
    author_id TEXT NOT NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (author_id) REFERENCES users(userid)
);

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

CREATE TABLE results (
    resultid INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    game_id INTEGER NOT NULL,
    result_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    score INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(userid),
    FOREIGN KEY (game_id) REFERENCES games(gameid)
);

-- Insert users
INSERT INTO users (userid, password, role) VALUES 
('admin1', 'adminpass', 'admin'),
('guest1', 'guestpass', 'guest'),
('guest2', 'guestpass2', 'guest'),
('guest3', 'guestpass3', 'guest'),
('guest4', 'guestpass4', 'guest');

-- Insert categories
INSERT INTO categories (id, name) VALUES
(17, 'Science'),
(19, 'Math'),
(12, 'Music'),
(25, 'Art'),
(23, 'History'),
(24, 'Politics'),
(22, 'Geography'),
(9,  'General Knowledge');

-- Insert games
INSERT INTO games (title, description, category_id, author_id) VALUES
('Carleton Computer Science', 'Trivia questions I wrote for this years SCS end-of-year barbeque.', 17, 'admin1'),
('World History', 'A journey through global events.', 23, 'admin1'),
('Movie Trivia', 'Guess the movie facts.', 9, 'guest1');


INSERT INTO questions (game_id, type, question, correct, option1, option2, option3) VALUES
(1, 'truefalse', 'Python is a statically-typed programming language.', 'false', NULL, NULL, NULL),
(1, 'multiselect', 'Which Canadian Prime Minister served as chancellor of Carleton University upon his retirement from politics?', 'Lester B. Pearson', 'Brian Mulroney', 'Pierre Trudeau', 'John Diefenbaker'),
(1, 'type', 'We all know our team name is the Ravens... but what is the name of our mascot?', 'Rodney', NULL, NULL, NULL),
(1, 'num', 'In what year was Carleton University (then known as Carleton College) founded?', '1942', NULL, NULL, NULL),
(1, 'multiselect', 'What do tech giants Amazon and Adobe both have in common?', 'Theyre both named after bodies of water', 'Jeff Bezos was CEO of both companies at some point', 'Theyre both named after Greek mythological communities', 'Amazon implies "A to Z" with its name and Adobe implies "A to B"');


INSERT INTO questions (game_id, type, question, correct, option1, option2, option3) VALUES
(2, 'truefalse', 'The Great Wall of China was built in a single year.', 'false', NULL, NULL, NULL),
(2, 'type', 'Who was the first President of the United States?', 'George Washington', NULL, NULL, NULL),
(2, 'num', 'In what year did WW1 begin?', '1914', NULL, NULL, NULL);

INSERT INTO questions (game_id, type, question, correct, option1, option2, option3) VALUES
(2, 'type', 'Who discovered America?', 'Christopher Columbus', NULL, NULL, NULL),
(2, 'truefalse', 'The Roman Empire fell in AD 476.', 'true', NULL, NULL, NULL),
(2, 'num', 'How many years did the Hundred Years War last?', '116', NULL, NULL, NULL),
(2, 'multiselect', 'Which of the following was one of the Seven Wonders of the Ancient World?', 'Great Pyramid of Giza', 'Colosseum', 'Hanging Gardens of Babylon', 'Statue of Zeus'),
(2, 'type', 'Who was known as the Maid of Orléans?', 'Joan of Arc', NULL, NULL, NULL),
(2, 'num', 'In what year did the Berlin Wall fall?', '1989', NULL, NULL, NULL),
(2, 'type', 'Which empire was ruled by Genghis Khan?', 'Mongol Empire', NULL, NULL, NULL);


INSERT INTO questions (game_id, type, question, correct, option1, option2, option3) VALUES
(3, 'type', 'Who directed Titanic?', 'James Cameron', NULL, NULL, NULL),
(3, 'truefalse', 'The movie Inception stars Leonardo DiCaprio.', 'true', NULL, NULL, NULL),
(3, 'multiselect', 'Which of these are Marvel movies?', 'Iron Man', 'Batman', 'NoMan', 'Superman'),
(3, 'num', 'How many Harry Potter movies are there?', '8', NULL, NULL, NULL);

INSERT INTO questions (game_id, type, question, correct, option1, option2, option3) VALUES
(3, 'truefalse', 'The movie "Avatar" was directed by Steven Spielberg.', 'false', NULL, NULL, NULL),
(3, 'type', 'Who played the Joker in "The Dark Knight"?', 'Heath Ledger', NULL, NULL, NULL),
(3, 'num', 'How many films are in the original Star Wars trilogy?', '3', NULL, NULL, NULL),
(3, 'multiselect', 'Which of these actors starred in "The Avengers"?', 'Robert Downey Jr.', 'Leonardo DiCaprio', 'Brad Pitt', 'Tom Cruise'),
(3, 'type', 'Which movie features the quote "Ill be back"?', 'The Terminator', NULL, NULL, NULL);


INSERT INTO results (user_id, game_id, score) VALUES
('guest1', 1, 2500),
('guest2', 1, 1000),
('guest3', 1, 2000),
('guest4', 1, 3500);

INSERT INTO results (user_id, game_id, score) VALUES
('guest1', 2, 6400),
('guest2', 2, 7200),
('guest3', 2, 8100),
('guest4', 2, 6900);

INSERT INTO results (user_id, game_id, score) VALUES
('guest1', 3, 9500),
('guest2', 3, 8300),
('guest3', 3, 7700),
('guest4', 3, 9200);

INSERT INTO results (user_id, game_id, score) VALUES
('guest1', 1, 3000),
('guest2', 1, 3700),
('guest3', 2, 1100),
('guest4', 3, 800);
