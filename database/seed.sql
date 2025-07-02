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
