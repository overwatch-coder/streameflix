-- Add overview column to favorites and watch_list tables
alter table favorites add column if not exists overview text;
alter table watch_list add column if not exists overview text;
