-- seed.sql
-- Dummy data for testing/development
PRAGMA foreign_keys = ON;
-- Insert Topics
INSERT
    OR IGNORE INTO topics (name, emoji)
VALUES ('Daily Essentials', '🛒'),
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
-- Insert Users with UUIDs
INSERT
    OR IGNORE INTO users (
        id,
        first_name,
        last_name,
        username,
        email,
        password_hash,
        age,
        gender,
        terms_accepted
    )
VALUES (
        '11111111-1111-1111-1111-111111111111',
        'Alice',
        'Walker',
        'home_lover',
        'home.lover@example.com',
        '$2a$10$ryPUUMn0CPeuNh.NpQZOwuyoymt1sdzXrePhSeYArwv9puWlg1mF2',
        28,
        'female',
        1
    ),
    (
        '22222222-2222-2222-2222-222222222222',
        'Bob',
        'Nguyen',
        'tech_guru',
        'tech.enthusiast@example.com',
        '$2a$10$ryPUUMn0CPeuNh.NpQZOwuyoymt1sdzXrePhSeYArwv9puWlg1mF2',
        35,
        'male',
        1
    ),
    (
        '33333333-3333-3333-3333-333333333333',
        'Carla',
        'Martinez',
        'fitness_fan',
        'healthy.living@example.com',
        '$2a$10$ryPUUMn0CPeuNh.NpQZOwuyoymt1sdzXrePhSeYArwv9puWlg1mF2',
        24,
        'female',
        1
    ),
    (
        '44444444-4444-4444-4444-444444444444',
        'David',
        'Kim',
        'food_explorer',
        'cooking.lover@example.com',
        '$2a$10$ryPUUMn0CPeuNh.NpQZOwuyoymt1sdzXrePhSeYArwv9puWlg1mF2',
        30,
        'other',
        1
    );
-- Insert Posts using UUIDs
INSERT
    OR IGNORE INTO posts (title, content, user_id)
VALUES (
        '10 Must-Have Home Organization Tools',
        'These affordable organizers transformed my small apartment...',
        '11111111-1111-1111-1111-111111111111'
    ),
    (
        'Review: The Newest Smartphone Features',
        'After testing the latest models, here are the most innovative features...',
        '22222222-2222-2222-2222-222222222222'
    ),
    (
        '5-Minute Morning Yoga Routine',
        'Start your day with this quick routine that boosts energy...',
        '33333333-3333-3333-3333-333333333333'
    ),
    (
        'Easy 15-Minute Pasta Recipe',
        'Perfect for busy weeknights - requires just 5 ingredients...',
        '44444444-4444-4444-4444-444444444444'
    );
-- Insert Posts-Topics relationships
INSERT
    OR IGNORE INTO posts_topics (post_id, topic_id)
VALUES (
        1,
        (
            SELECT id
            FROM topics
            WHERE name = 'Home & Lifestyle'
        )
    ),
    (
        1,
        (
            SELECT id
            FROM topics
            WHERE name = 'Daily Essentials'
        )
    ),
    (
        2,
        (
            SELECT id
            FROM topics
            WHERE name = 'Technology & Innovation'
        )
    ),
    (
        3,
        (
            SELECT id
            FROM topics
            WHERE name = 'Personal Well-being'
        )
    ),
    (
        4,
        (
            SELECT id
            FROM topics
            WHERE name = 'Quick Recipes'
        )
    ),
    (
        4,
        (
            SELECT id
            FROM topics
            WHERE name = 'Nutrition Insights'
        )
    );
-- Insert Comments using UUIDs
INSERT
    OR IGNORE INTO comments (content, user_id, post_id)
VALUES (
        'That closet organizer changed my life too!',
        '22222222-2222-2222-2222-222222222222',
        1
    ),
    (
        'The camera improvements are impressive this year',
        '11111111-1111-1111-1111-111111111111',
        2
    ),
    (
        'Do you have modifications for back pain?',
        '44444444-4444-4444-4444-444444444444',
        3
    ),
    (
        'Added some spinach for extra nutrition - delicious!',
        '33333333-3333-3333-3333-333333333333',
        4
    );
