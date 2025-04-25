-- seed.sql
-- Dummy data for testing/development

-- Enable foreign key support
PRAGMA foreign_keys = ON;

-- Insert Topics (extracted from template)
INSERT OR IGNORE INTO topics (name, emoji) VALUES
('Daily Essentials', '🛒'),
('Home & Lifestyle', '🏠'),
('Personal Well-being', '💖'),
('Technology & Innovation', '💻'),
('Leisure & Entertainment', '🎮'),
('Commerce & Shopping', '🛍️'),
('Mobility & Transportation', '🚗'),
('Services & Support', '🤝'),
('Culture & Community', '🌎'),
('Information & Learning', '🎓'),
('Quick Recipes', '🍳'),
('Nutrition Insights', '🍎');

-- Insert Users with realistic usernames and matching passwords
-- Passwords are bcrypt hashes of "password123" for all demo users
INSERT OR IGNORE INTO users (
    first_name, last_name, username, email, password_hash, age, gender, terms_accepted
) VALUES
('Alice', 'Walker', 'home_lover', 'home.lover@example.com', '$2a$10$ryPUUMn0CPeuNh.NpQZOwuyoymt1sdzXrePhSeYArwv9puWlg1mF2', 28, 'female', 1),
('Bob', 'Nguyen', 'tech_guru', 'tech.enthusiast@example.com', '$2a$10$ryPUUMn0CPeuNh.NpQZOwuyoymt1sdzXrePhSeYArwv9puWlg1mF2', 35, 'male', 1),
('Carla', 'Martinez', 'fitness_fan', 'healthy.living@example.com', '$2a$10$ryPUUMn0CPeuNh.NpQZOwuyoymt1sdzXrePhSeYArwv9puWlg1mF2', 24, 'female', 1),
('David', 'Kim', 'food_explorer', 'cooking.lover@example.com', '$2a$10$ryPUUMn0CPeuNh.NpQZOwuyoymt1sdzXrePhSeYArwv9puWlg1mF2', 30, 'other', 1);

-- Insert Posts with topics matching the new categories
-- Insert Posts
INSERT OR IGNORE INTO posts (title, content, user_id) VALUES
('10 Must-Have Home Organization Tools', 'These affordable organizers transformed my small apartment...', 1),
('Review: The Newest Smartphone Features', 'After testing the latest models, here are the most innovative features...', 2),
('5-Minute Morning Yoga Routine', 'Start your day with this quick routine that boosts energy...', 3),
('Easy 15-Minute Pasta Recipe', 'Perfect for busy weeknights - requires just 5 ingredients...', 4);


-- Insert relationships between posts and topics
INSERT OR IGNORE INTO posts_topics (post_id, topic_id) VALUES
(1, (SELECT id FROM topics WHERE name = 'Home & Lifestyle')),
(1, (SELECT id FROM topics WHERE name = 'Daily Essentials')),
(2, (SELECT id FROM topics WHERE name = 'Technology & Innovation')),
(3, (SELECT id FROM topics WHERE name = 'Personal Well-being')),
(4, (SELECT id FROM topics WHERE name = 'Quick Recipes')),
(4, (SELECT id FROM topics WHERE name = 'Nutrition Insights'));






-- Insert Comments
INSERT OR IGNORE INTO comments (content, user_id, post_id) VALUES
('That closet organizer changed my life too!', 2, 1),
('The camera improvements are impressive this year', 1, 2),
('Do you have modifications for back pain?', 4, 3),
('Added some spinach for extra nutrition - delicious!', 3, 4);

-- Insert Votes
INSERT OR IGNORE INTO votes (user_id, post_id, vote) VALUES
(2, 1, 1),   -- tech_guru upvotes home organization post
(1, 2, 1),   -- home_lover upvotes tech review
(4, 3, 1),   -- food_explorer upvotes yoga routine
(3, 4, -1);  -- fitness_fan downvotes pasta recipe (too carb-heavy)
