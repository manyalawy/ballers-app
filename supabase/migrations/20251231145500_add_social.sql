-- Social features: friendships and user blocks

-- User blocks table
CREATE TABLE user_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blocker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(blocker_id, blocked_id),
  CHECK (blocker_id != blocked_id)
);

-- Indexes for user blocks
CREATE INDEX idx_user_blocks_blocker_id ON user_blocks(blocker_id);
CREATE INDEX idx_user_blocks_blocked_id ON user_blocks(blocked_id);

-- Friendships table
CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status friendship_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  UNIQUE(requester_id, addressee_id),
  CHECK (requester_id != addressee_id)
);

-- Indexes for friendships
CREATE INDEX idx_friendships_requester_id ON friendships(requester_id);
CREATE INDEX idx_friendships_addressee_id ON friendships(addressee_id);
CREATE INDEX idx_friendships_status ON friendships(status);

-- Function to check if two users are friends
CREATE OR REPLACE FUNCTION are_friends(user1_id UUID, user2_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.friendships
    WHERE status = 'accepted'
      AND (
        (requester_id = user1_id AND addressee_id = user2_id)
        OR (requester_id = user2_id AND addressee_id = user1_id)
      )
  );
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- Function to check if user is blocked
CREATE OR REPLACE FUNCTION is_blocked(checker_id UUID, target_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_blocks
    WHERE (blocker_id = checker_id AND blocked_id = target_id)
       OR (blocker_id = target_id AND blocked_id = checker_id)
  );
END;
$$ LANGUAGE plpgsql SET search_path = '';
