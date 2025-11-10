CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('teacher', 'student') NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    avatar_url VARCHAR(500),
    is_online BOOLEAN DEFAULT FALSE,
    last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
);

CREATE TABLE IF NOT EXISTS classes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    teacher_id INT NOT NULL,
    name VARCHAR(200) NOT NULL,
    subject VARCHAR(200),
    year INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_teacher (teacher_id)
);

CREATE TABLE IF NOT EXISTS class_students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    class_id INT NOT NULL,
    student_id INT NOT NULL,
    enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_enrollment (class_id, student_id),
    INDEX idx_class (class_id),
    INDEX idx_student (student_id)
);

CREATE TABLE conversations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    type ENUM('direct', 'group') NOT NULL DEFAULT 'direct',
    name VARCHAR(200),
    created_by INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_type (type)
);

CREATE TABLE conversation_participants (
    id INT PRIMARY KEY AUTO_INCREMENT,
    conversation_id INT NOT NULL,
    user_id INT NOT NULL,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_read_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_participant (conversation_id, user_id),
    INDEX idx_conversation (conversation_id),
    INDEX idx_user (user_id)
);

CREATE TABLE messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    conversation_id INT NOT NULL,
    sender_id INT NOT NULL,
    content TEXT NOT NULL,
    message_type ENUM('text', 'image', 'document', 'link') DEFAULT 'text',
    attachment_url VARCHAR(500),
    attachment_name VARCHAR(300),
    attachment_size INT,
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at DATETIME,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_conversation (conversation_id),
    INDEX idx_sender (sender_id),
    INDEX idx_created (created_at)
);

CREATE TABLE forums (
    id INT PRIMARY KEY AUTO_INCREMENT,
    created_by INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    visibility ENUM('public', 'class', 'specific') DEFAULT 'public',
    status ENUM('active', 'archived', 'scheduled') DEFAULT 'active',
    start_date DATETIME,
    end_date DATETIME,
    is_pinned BOOLEAN DEFAULT FALSE,
    member_count INT DEFAULT 0,
    post_count INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_created_by (created_by),
    INDEX idx_status (status),
    INDEX idx_category (category),
    FULLTEXT KEY ft_title_desc (title, description)
);

CREATE TABLE forum_members (
    id INT PRIMARY KEY AUTO_INCREMENT,
    forum_id INT NOT NULL,
    user_id INT NOT NULL,
    role ENUM('member', 'moderator', 'admin') DEFAULT 'member',
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (forum_id) REFERENCES forums(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_membership (forum_id, user_id),
    INDEX idx_forum (forum_id),
    INDEX idx_user (user_id)
);

CREATE TABLE forum_tags (
    id INT PRIMARY KEY AUTO_INCREMENT,
    forum_id INT NOT NULL,
    tag_name VARCHAR(50) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (forum_id) REFERENCES forums(id) ON DELETE CASCADE,
    UNIQUE KEY unique_tag (forum_id, tag_name),
    INDEX idx_tag (tag_name)
);

CREATE TABLE forum_posts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    forum_id INT NOT NULL,
    author_id INT NOT NULL,
    title VARCHAR(300) NOT NULL,
    content TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at DATETIME,
    view_count INT DEFAULT 0,
    reply_count INT DEFAULT 0,
    reaction_count INT DEFAULT 0,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (forum_id) REFERENCES forums(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_forum (forum_id),
    INDEX idx_author (author_id),
    INDEX idx_pinned (is_pinned),
    FULLTEXT KEY ft_title_content (title, content)
);

CREATE TABLE post_attachments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_name VARCHAR(300) NOT NULL,
    file_type VARCHAR(50),
    file_size INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE,
    INDEX idx_post (post_id)
);

CREATE TABLE post_tags (
    id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT NOT NULL,
    tag_name VARCHAR(50) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE,
    INDEX idx_tag (tag_name)
);

CREATE TABLE comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT NOT NULL,
    author_id INT NOT NULL,
    parent_id INT,
    content TEXT NOT NULL,
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at DATETIME,
    reaction_count INT DEFAULT 0,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE,
    INDEX idx_post (post_id),
    INDEX idx_author (author_id),
    INDEX idx_parent (parent_id)
);

CREATE TABLE reactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    target_type ENUM('post', 'comment') NOT NULL,
    target_id INT NOT NULL,
    reaction_type VARCHAR(20) DEFAULT 'like',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_reaction (user_id, target_type, target_id),
    INDEX idx_target (target_type, target_id),
    INDEX idx_user (user_id)
);

CREATE TABLE saved_posts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE,
    UNIQUE KEY unique_saved (user_id, post_id),
    INDEX idx_user (user_id)
);

CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT,
    related_type ENUM('message', 'post', 'comment', 'forum', 'lesson', 'performance') DEFAULT NULL,
    related_id INT,
    is_read BOOLEAN DEFAULT FALSE,
    read_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_read (is_read),
    INDEX idx_created (created_at)
);

CREATE TABLE muted_users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    forum_id INT NOT NULL,
    user_id INT NOT NULL,
    muted_by INT NOT NULL,
    reason TEXT,
    muted_until DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (forum_id) REFERENCES forums(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (muted_by) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_mute (forum_id, user_id),
    INDEX idx_forum (forum_id),
    INDEX idx_user (user_id)
);

CREATE TABLE reported_content (
    id INT PRIMARY KEY AUTO_INCREMENT,
    reporter_id INT NOT NULL,
    content_type ENUM('post', 'comment', 'message') NOT NULL,
    content_id INT NOT NULL,
    reason ENUM('spam', 'harassment', 'inappropriate', 'offensive', 'other') NOT NULL,
    description TEXT,
    status ENUM('pending', 'under_review', 'resolved', 'dismissed') DEFAULT 'pending',
    reviewed_by INT,
    reviewed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_content (content_type, content_id)
);

CREATE OR REPLACE VIEW unread_message_counts AS
SELECT 
    cp.user_id,
    c.id as conversation_id,
    COUNT(m.id) as unread_count
FROM conversation_participants cp
LEFT JOIN conversations c ON cp.conversation_id = c.id
LEFT JOIN messages m ON c.id = m.conversation_id 
    AND m.sender_id != cp.user_id 
    AND m.created_at > cp.last_read_at
    AND m.is_deleted = FALSE
GROUP BY cp.user_id, c.id;

CREATE OR REPLACE VIEW forum_statistics AS
SELECT 
    f.id as forum_id,
    COUNT(DISTINCT fm.user_id) as member_count,
    COUNT(DISTINCT fp.id) as post_count,
    COUNT(DISTINCT c.id) as comment_count,
    MAX(GREATEST(IFNULL(fp.updated_at, fp.created_at), IFNULL(c.created_at, fp.created_at))) as last_activity
FROM forums f
LEFT JOIN forum_members fm ON f.id = fm.forum_id
LEFT JOIN forum_posts fp ON f.id = fp.forum_id AND fp.is_deleted = FALSE
LEFT JOIN comments c ON fp.id = c.post_id AND c.is_deleted = FALSE
GROUP BY f.id;

CREATE OR REPLACE VIEW forum_user_activity AS
SELECT 
    fm.user_id,
    fm.forum_id,
    COUNT(DISTINCT fp.id) as posts_count,
    COUNT(DISTINCT c.id) as comments_count,
    COUNT(DISTINCT r.id) as reactions_count,
    MAX(GREATEST(
        IFNULL(fp.created_at, '1970-01-01'),
        IFNULL(c.created_at, '1970-01-01')
    )) as last_activity_date
FROM forum_members fm
LEFT JOIN forum_posts fp ON fm.forum_id = fp.forum_id AND fp.author_id = fm.user_id AND fp.is_deleted = FALSE
LEFT JOIN comments c ON fm.forum_id = (
    SELECT forum_id FROM forum_posts WHERE id = c.post_id
) AND c.author_id = fm.user_id AND c.is_deleted = FALSE
LEFT JOIN reactions r ON r.user_id = fm.user_id AND r.target_type IN ('post', 'comment')
GROUP BY fm.user_id, fm.forum_id;

