-- Chat rooms and messages tables

CREATE TABLE chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(match_id)
);

-- Index for chat rooms
CREATE INDEX idx_chat_rooms_match_id ON chat_rooms(match_id);
CREATE INDEX idx_chat_rooms_last_message_at ON chat_rooms(last_message_at DESC);

CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type message_type NOT NULL DEFAULT 'text',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for messages
CREATE INDEX idx_chat_messages_chat_room_id ON chat_messages(chat_room_id);
CREATE INDEX idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(chat_room_id, created_at DESC);

-- Trigger to update last_message_at on chat room
CREATE OR REPLACE FUNCTION update_chat_room_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.chat_rooms
  SET last_message_at = NEW.created_at
  WHERE id = NEW.chat_room_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

CREATE TRIGGER chat_message_inserted
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_room_last_message();

-- Function to auto-create chat room when match is created
CREATE OR REPLACE FUNCTION create_match_chat_room()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.chat_rooms (match_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

CREATE TRIGGER match_chat_room_created
  AFTER INSERT ON matches
  FOR EACH ROW
  EXECUTE FUNCTION create_match_chat_room();
