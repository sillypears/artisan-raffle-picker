--
-- File generated with SQLiteStudio v3.2.1 on Sat Feb 6 15:56:30 2021
--
-- Text encoding used: System
--
PRAGMA foreign_keys = off;
BEGIN TRANSACTION;

-- Table: denylist
DROP TABLE IF EXISTS denylist;

CREATE TABLE denylist (
    id     INTEGER       PRIMARY KEY ASC ON CONFLICT ABORT AUTOINCREMENT
                         UNIQUE ON CONFLICT ABORT
                         NOT NULL ON CONFLICT ABORT,
    userid INTEGER       REFERENCES users (id) 
                         NOT NULL ON CONFLICT ABORT,
    date   DATETIME      NOT NULL ON CONFLICT ABORT,
    reason VARCHAR (400) COLLATE NOCASE
);


-- Table: raffles
DROP TABLE IF EXISTS raffles;

CREATE TABLE raffles (
    id       INTEGER       PRIMARY KEY ASC ON CONFLICT ABORT AUTOINCREMENT
                           UNIQUE
                           NOT NULL,
    date     DATETIME      NOT NULL ON CONFLICT ABORT,
    title    VARCHAR (100) UNIQUE ON CONFLICT ABORT
                           NOT NULL ON CONFLICT ABORT
                           COLLATE NOCASE,
    gsheetId VARCHAR (200) UNIQUE
);

-- Table: entrants
DROP TABLE IF EXISTS entrants;

CREATE TABLE entrants (
    id       INTEGER PRIMARY KEY ASC ON CONFLICT FAIL AUTOINCREMENT
                     UNIQUE ON CONFLICT FAIL
                     NOT NULL ON CONFLICT FAIL,
    userId   INTEGER REFERENCES users (id) 
                     NOT NULL ON CONFLICT FAIL,
    raffleId INTEGER REFERENCES raffles (id) 
                     NOT NULL ON CONFLICT FAIL
);


-- Table: rolls
DROP TABLE IF EXISTS rolls;

CREATE TABLE rolls (
    id       INTEGER  PRIMARY KEY ASC ON CONFLICT ABORT AUTOINCREMENT
                      UNIQUE ON CONFLICT ABORT
                      NOT NULL ON CONFLICT ABORT,
    date     DATETIME NOT NULL ON CONFLICT ABORT,
    raffleId INTEGER  REFERENCES raffles (id) 
                      NOT NULL ON CONFLICT ABORT,
    userId   INTEGER  REFERENCES users (id) 
                      NOT NULL
);


-- Table: users
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id       INTEGER       PRIMARY KEY ASC ON CONFLICT ABORT AUTOINCREMENT
                           UNIQUE ON CONFLICT ABORT
                           NOT NULL ON CONFLICT ABORT,
    username VARCHAR (40)  UNIQUE ON CONFLICT ABORT
                           NOT NULL ON CONFLICT ABORT
                           COLLATE NOCASE,
    email    VARCHAR (200) UNIQUE ON CONFLICT ABORT
                           NOT NULL ON CONFLICT ABORT
                           COLLATE NOCASE,
    platform VARCHAR (20)  NOT NULL ON CONFLICT ABORT
                           COLLATE NOCASE
);


-- Index: denyId
DROP INDEX IF EXISTS denyId;

CREATE INDEX denyId ON denylist (
    id
);


-- Index: raffleId
DROP INDEX IF EXISTS raffleId;

CREATE INDEX raffleId ON raffles (
    id
);

-- Index: entrantsId
DROP INDEX IF EXISTS entrantsId;

CREATE INDEX entrantsId ON entrants (
    id ASC
);

-- Index: rollId
DROP INDEX IF EXISTS rollId;

CREATE INDEX rollId ON rolls (
    id
);


-- Index: userId
DROP INDEX IF EXISTS userId;

CREATE INDEX userId ON users (
    id
);


-- View: Winners By Raffle
DROP VIEW IF EXISTS "Winners By Raffle";
CREATE VIEW raffle_winners AS
    SELECT r.title,
           u.username,
           u.platform
      FROM rolls ro
           LEFT JOIN
           raffles r ON ro.raffleId = r.id
           LEFT JOIN
           users u ON ro.userId = u.id
     GROUP BY title;



COMMIT TRANSACTION;
PRAGMA foreign_keys = on;
