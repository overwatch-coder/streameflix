-- Add missing UPDATE policies for favorites and watch_list to allow upsert to work correctly

-- Favorites
create policy "Users can update their own favorites." on favorites
  for update using (auth.uid() = user_id);

-- Watch List
create policy "Users can update their own watch list." on watch_list
  for update using (auth.uid() = user_id);

-- Ensure watch_history policies are robust (redundant but safe)
drop policy if exists "Users can insert/update their own watch history." on watch_history;

create policy "Users can view their own watch history." on watch_history
  for select using (auth.uid() = user_id);

create policy "Users can insert their own watch history." on watch_history
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own watch history." on watch_history
  for update using (auth.uid() = user_id);

create policy "Users can delete their own watch history." on watch_history
  for delete using (auth.uid() = user_id);
