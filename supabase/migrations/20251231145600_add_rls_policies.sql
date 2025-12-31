-- Row Level Security Policies

-- Enable RLS on all tables
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- Cities: Public read access
CREATE POLICY "Cities are viewable by everyone"
  ON cities FOR SELECT
  USING (is_active = true);

-- Sports: Public read access
CREATE POLICY "Sports are viewable by everyone"
  ON sports FOR SELECT
  USING (is_active = true);

-- Profiles: Public read, own write
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- User Sports: Public read, own write
CREATE POLICY "User sports are viewable by everyone"
  ON user_sports FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own sports"
  ON user_sports FOR ALL
  USING (auth.uid() = user_id);

-- Matches: Public read for upcoming, own management
CREATE POLICY "Upcoming matches are viewable by everyone"
  ON matches FOR SELECT
  USING (
    status = 'upcoming'
    AND NOT is_blocked(auth.uid(), creator_id)
  );

CREATE POLICY "Users can view matches they created or joined"
  ON matches FOR SELECT
  USING (
    creator_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM match_participants
      WHERE match_id = matches.id
        AND user_id = auth.uid()
        AND status = 'approved'
    )
  );

CREATE POLICY "Users can create matches"
  ON matches FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update own matches"
  ON matches FOR UPDATE
  USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete own matches"
  ON matches FOR DELETE
  USING (auth.uid() = creator_id);

-- Match Participants: Read for participants, request for anyone
CREATE POLICY "Participants viewable by match creator and participants"
  ON match_participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM matches
      WHERE id = match_participants.match_id
        AND (creator_id = auth.uid() OR EXISTS (
          SELECT 1 FROM match_participants mp
          WHERE mp.match_id = matches.id
            AND mp.user_id = auth.uid()
            AND mp.status = 'approved'
        ))
    )
  );

CREATE POLICY "Users can request to join matches"
  ON match_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Creators can update participant status"
  ON match_participants FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM matches
      WHERE id = match_participants.match_id
        AND creator_id = auth.uid()
    )
  );

CREATE POLICY "Users can withdraw own requests"
  ON match_participants FOR DELETE
  USING (auth.uid() = user_id);

-- Chat Rooms: Access for approved participants only
CREATE POLICY "Chat rooms viewable by approved participants"
  ON chat_rooms FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM match_participants
      WHERE match_id = chat_rooms.match_id
        AND user_id = auth.uid()
        AND status = 'approved'
    )
    OR EXISTS (
      SELECT 1 FROM matches
      WHERE id = chat_rooms.match_id
        AND creator_id = auth.uid()
    )
  );

-- Chat Messages: Read/Write for approved participants
CREATE POLICY "Messages viewable by approved participants"
  ON chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_rooms cr
      JOIN match_participants mp ON mp.match_id = cr.match_id
      WHERE cr.id = chat_messages.chat_room_id
        AND mp.user_id = auth.uid()
        AND mp.status = 'approved'
    )
    OR EXISTS (
      SELECT 1 FROM chat_rooms cr
      JOIN matches m ON m.id = cr.match_id
      WHERE cr.id = chat_messages.chat_room_id
        AND m.creator_id = auth.uid()
    )
  );

CREATE POLICY "Approved participants can send messages"
  ON chat_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND (
      EXISTS (
        SELECT 1 FROM chat_rooms cr
        JOIN match_participants mp ON mp.match_id = cr.match_id
        WHERE cr.id = chat_messages.chat_room_id
          AND mp.user_id = auth.uid()
          AND mp.status = 'approved'
      )
      OR EXISTS (
        SELECT 1 FROM chat_rooms cr
        JOIN matches m ON m.id = cr.match_id
        WHERE cr.id = chat_messages.chat_room_id
          AND m.creator_id = auth.uid()
      )
    )
  );

-- Ratings: Participants can rate each other after match
CREATE POLICY "Ratings viewable by everyone"
  ON ratings FOR SELECT
  USING (true);

CREATE POLICY "Participants can rate others from same match"
  ON ratings FOR INSERT
  WITH CHECK (
    auth.uid() = rater_id
    AND auth.uid() != rated_user_id
    AND EXISTS (
      SELECT 1 FROM matches m
      WHERE m.id = match_id
        AND m.status = 'completed'
        AND (
          m.creator_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM match_participants
            WHERE match_id = m.id AND user_id = auth.uid() AND status = 'approved'
          )
        )
        AND (
          m.creator_id = rated_user_id
          OR EXISTS (
            SELECT 1 FROM match_participants
            WHERE match_id = m.id AND user_id = rated_user_id AND status = 'approved'
          )
        )
    )
  );

-- User Blocks: Own blocks only
CREATE POLICY "Users can view own blocks"
  ON user_blocks FOR SELECT
  USING (auth.uid() = blocker_id);

CREATE POLICY "Users can create blocks"
  ON user_blocks FOR INSERT
  WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can delete own blocks"
  ON user_blocks FOR DELETE
  USING (auth.uid() = blocker_id);

-- Friendships: Involved parties only
CREATE POLICY "Users can view own friendships"
  ON friendships FOR SELECT
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "Users can send friend requests"
  ON friendships FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update friendships they're part of"
  ON friendships FOR UPDATE
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "Users can delete friendships they're part of"
  ON friendships FOR DELETE
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);
