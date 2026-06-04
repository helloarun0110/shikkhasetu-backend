

CREATE DATABASE IF NOT EXISTS shikkhasetu;
USE shikkhasetu;



CREATE TABLE IF NOT EXISTS users (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name           VARCHAR(100)  NOT NULL,
  email               VARCHAR(150)  NOT NULL UNIQUE,
  phone               VARCHAR(20)   NOT NULL,
  password_hash       VARCHAR(255)  NOT NULL,
  role                ENUM('volunteer', 'organizer', 'admin') NOT NULL,
  profile_picture_url VARCHAR(500)  DEFAULT NULL,
  is_verified         BOOLEAN       DEFAULT FALSE,
  is_active           BOOLEAN       DEFAULT TRUE,
  created_at          DATETIME      DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);





CREATE TABLE IF NOT EXISTS volunteer_profiles (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id             INT UNSIGNED NOT NULL UNIQUE,

  university_name     VARCHAR(200) NOT NULL,
  department          VARCHAR(150) NOT NULL,
  academic_year       VARCHAR(20)  DEFAULT NULL,
  bio                 TEXT         DEFAULT NULL,
  experience_text     TEXT         DEFAULT NULL,

  district            VARCHAR(100) NOT NULL,
  upazila             VARCHAR(100) DEFAULT NULL,
  address             TEXT         DEFAULT NULL,

  teaching_mode       ENUM('online', 'offline', 'both') DEFAULT 'both',
  open_to_volunteer   BOOLEAN      DEFAULT FALSE,

  preferred_start_time TIME        DEFAULT NULL,
  preferred_end_time   TIME        DEFAULT NULL,

  created_at          DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);




CREATE TABLE IF NOT EXISTS organizer_profiles (
  id                          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id                     INT UNSIGNED NOT NULL UNIQUE,

  institution_name            VARCHAR(200) NOT NULL,
  institution_type            VARCHAR(100) DEFAULT NULL,
  description                 TEXT         DEFAULT NULL,

  district                    VARCHAR(100) NOT NULL,
  upazila                     VARCHAR(100) DEFAULT NULL,
  address                     TEXT         DEFAULT NULL,

  website_url                 VARCHAR(500) DEFAULT NULL,
  verification_document_url   VARCHAR(500) DEFAULT NULL,

  contact_person_name         VARCHAR(100) DEFAULT NULL,
  contact_person_designation  VARCHAR(100) DEFAULT NULL,

  created_at                  DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at                  DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);






CREATE TABLE IF NOT EXISTS subjects (
  id    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name  VARCHAR(100) NOT NULL UNIQUE
);



INSERT INTO subjects (name) VALUES
  ('Mathematics'),
  ('English'),
  ('Physics'),
  ('Chemistry'),
  ('Biology'),
  ('History'),
  ('Geography'),
  ('Bangla'),
  ('ICT'),
  ('General Science')
ON DUPLICATE KEY UPDATE name = name;






CREATE TABLE IF NOT EXISTS volunteer_subjects (
  id                    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  volunteer_profile_id  INT UNSIGNED NOT NULL,
  subject_id            INT UNSIGNED NOT NULL,
  skill_level           ENUM('basic', 'intermediate', 'advanced') DEFAULT 'intermediate',

  UNIQUE KEY unique_volunteer_subject (volunteer_profile_id, subject_id),

  FOREIGN KEY (volunteer_profile_id) REFERENCES volunteer_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id)           REFERENCES subjects(id)           ON DELETE CASCADE
);







CREATE TABLE IF NOT EXISTS classes (
  id    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name  VARCHAR(50) NOT NULL UNIQUE
);


INSERT INTO classes (name) VALUES
  ('Class 1'),
  ('Class 2'),
  ('Class 3'),
  ('Class 4'),
  ('Class 5'),
  ('Class 6'),
  ('Class 7'),
  ('Class 8'),
  ('Class 9'),
  ('Class 10'),
  ('Class 11'),
  ('Class 12')
ON DUPLICATE KEY UPDATE name = name;


CREATE TABLE IF NOT EXISTS volunteer_classes (
  id                    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  volunteer_profile_id  INT UNSIGNED NOT NULL,
  class_id              INT UNSIGNED NOT NULL,

  UNIQUE KEY unique_volunteer_class (volunteer_profile_id, class_id),

  FOREIGN KEY (volunteer_profile_id) REFERENCES volunteer_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (class_id)             REFERENCES classes(id)            ON DELETE CASCADE
);




CREATE TABLE IF NOT EXISTS volunteer_availability (
  id                    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  volunteer_profile_id  INT UNSIGNED NOT NULL,

  day_of_week           ENUM('Saturday','Sunday','Monday','Tuesday','Wednesday','Thursday','Friday') NOT NULL,
  start_time            TIME NOT NULL,
  end_time              TIME NOT NULL,
  is_active             BOOLEAN DEFAULT TRUE,

  FOREIGN KEY (volunteer_profile_id) REFERENCES volunteer_profiles(id) ON DELETE CASCADE
);





CREATE TABLE IF NOT EXISTS volunteer_open_status (
  id                      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  volunteer_profile_id    INT UNSIGNED NOT NULL UNIQUE,

  is_open                 BOOLEAN  DEFAULT FALSE,
  available_from_date     DATE     DEFAULT NULL,
  available_to_date       DATE     DEFAULT NULL,

  max_sessions_allowed    INT      DEFAULT 5,
  current_active_sessions INT      DEFAULT 0,

  created_at              DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at              DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (volunteer_profile_id) REFERENCES volunteer_profiles(id) ON DELETE CASCADE
);







CREATE TABLE IF NOT EXISTS session_requests (
  id                    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

  organizer_profile_id  INT UNSIGNED NOT NULL,
  volunteer_profile_id  INT UNSIGNED NOT NULL,
  subject_id            INT UNSIGNED NOT NULL,

  title                 VARCHAR(200) NOT NULL,
  description           TEXT         DEFAULT NULL,

  requested_date        DATE         NOT NULL,
  start_time            TIME         NOT NULL,
  end_time              TIME         NOT NULL,

  mode                  ENUM('online', 'offline') NOT NULL,
  meeting_link          VARCHAR(500) DEFAULT NULL,

  status                ENUM(
                          'pending',
                          'accepted',
                          'rejected',
                          'expired',
                          'cancelled',
                          'auto_invalidated'
                        ) DEFAULT 'pending',

  expires_at            DATETIME     NOT NULL,
  responded_at          DATETIME     DEFAULT NULL,

  created_at            DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at            DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (organizer_profile_id)  REFERENCES organizer_profiles(id)  ON DELETE CASCADE,
  FOREIGN KEY (volunteer_profile_id)  REFERENCES volunteer_profiles(id)  ON DELETE CASCADE,
  FOREIGN KEY (subject_id)            REFERENCES subjects(id)            ON DELETE RESTRICT
);

-- Index for fast overlap queries (used in auto-invalidation)
CREATE INDEX idx_requests_volunteer_date
  ON session_requests(volunteer_profile_id, requested_date, status);


-- Created ONLY after a request is accepted.


CREATE TABLE IF NOT EXISTS sessions (
  id                    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

  request_id            INT UNSIGNED NOT NULL UNIQUE,
  organizer_profile_id  INT UNSIGNED NOT NULL,
  volunteer_profile_id  INT UNSIGNED NOT NULL,
  subject_id            INT UNSIGNED NOT NULL,

  session_title         VARCHAR(200) NOT NULL,
  session_date          DATE         NOT NULL,
  start_time            TIME         NOT NULL,
  end_time              TIME         NOT NULL,

  mode                  ENUM('online', 'offline') NOT NULL,
  meeting_link          VARCHAR(500) DEFAULT NULL,

  status                ENUM('scheduled', 'completed', 'cancelled') DEFAULT 'scheduled',

  completion_notes      TEXT         DEFAULT NULL,

  created_at            DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at            DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (request_id)            REFERENCES session_requests(id)   ON DELETE RESTRICT,
  FOREIGN KEY (organizer_profile_id)  REFERENCES organizer_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (volunteer_profile_id)  REFERENCES volunteer_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id)            REFERENCES subjects(id)           ON DELETE RESTRICT
);






CREATE TABLE IF NOT EXISTS notifications (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id             INT UNSIGNED NOT NULL,

  type                ENUM(
                        'new_request',
                        'request_accepted',
                        'request_rejected',
                        'request_expired',
                        'request_auto_invalidated',
                        'session_reminder',
                        'session_completed',
                        'session_cancelled',
                        'new_open_volunteer'
                      ) NOT NULL,

  title               VARCHAR(200) NOT NULL,
  message             TEXT         NOT NULL,

  related_request_id  INT UNSIGNED DEFAULT NULL,
  related_session_id  INT UNSIGNED DEFAULT NULL,

  is_read             BOOLEAN      DEFAULT FALSE,

  created_at          DATETIME     DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index for fast unread count queries
CREATE INDEX idx_notifications_user_read
  ON notifications(user_id, is_read);





CREATE TABLE IF NOT EXISTS organizer_saved_volunteers (
  id                    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  organizer_profile_id  INT UNSIGNED NOT NULL,
  volunteer_profile_id  INT UNSIGNED NOT NULL,
  created_at            DATETIME DEFAULT CURRENT_TIMESTAMP,

  UNIQUE KEY unique_saved (organizer_profile_id, volunteer_profile_id),

  FOREIGN KEY (organizer_profile_id) REFERENCES organizer_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (volunteer_profile_id) REFERENCES volunteer_profiles(id) ON DELETE CASCADE
);








CREATE TABLE IF NOT EXISTS volunteer_reviews (
  id                    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  session_id            INT UNSIGNED NOT NULL UNIQUE,

  organizer_profile_id  INT UNSIGNED NOT NULL,
  volunteer_profile_id  INT UNSIGNED NOT NULL,

  rating                TINYINT UNSIGNED NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text           TEXT DEFAULT NULL,

  created_at            DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (session_id)            REFERENCES sessions(id)           ON DELETE CASCADE,
  FOREIGN KEY (organizer_profile_id)  REFERENCES organizer_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (volunteer_profile_id)  REFERENCES volunteer_profiles(id) ON DELETE CASCADE
);