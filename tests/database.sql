CREATE TABLE photos
(
    id           SERIAL PRIMARY KEY,
    name         TEXT,
    description  TEXT,
    filename     TEXT,
    views        INT     NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT FALSE
);
