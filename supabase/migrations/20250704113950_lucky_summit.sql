/*
  # Create votes table for donation platform

  1. New Tables
    - `votes`
      - `id` (uuid, primary key)
      - `request_id` (uuid, foreign key)
      - `voter_id` (uuid, foreign key)
      - `vote_type` (text, check constraint)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `votes` table
    - Add policies for vote access control
    - Prevent duplicate votes from same user
*/

-- Create votes table
CREATE TABLE IF NOT EXISTS votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  voter_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vote_type text NOT NULL CHECK (vote_type IN ('approve', 'reject')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(request_id, voter_id)
);

-- Enable RLS
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read votes"
  ON votes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Verifiers can insert votes"
  ON votes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('verifier', 'admin')
    )
    AND voter_id = auth.uid()
  );

CREATE POLICY "Voters can read own votes"
  ON votes
  FOR SELECT
  TO authenticated
  USING (voter_id = auth.uid());

-- Function to automatically update request status based on votes
CREATE OR REPLACE FUNCTION update_request_status()
RETURNS TRIGGER AS $$
DECLARE
  total_votes INTEGER;
  approve_votes INTEGER;
  reject_votes INTEGER;
BEGIN
  -- Count votes for the request
  SELECT COUNT(*) INTO total_votes
  FROM votes
  WHERE request_id = NEW.request_id;

  SELECT COUNT(*) INTO approve_votes
  FROM votes
  WHERE request_id = NEW.request_id AND vote_type = 'approve';

  SELECT COUNT(*) INTO reject_votes
  FROM votes
  WHERE request_id = NEW.request_id AND vote_type = 'reject';

  -- Update request status if we have enough votes
  IF total_votes >= 3 THEN
    IF approve_votes > reject_votes THEN
      UPDATE requests
      SET status = 'approved'
      WHERE id = NEW.request_id AND status = 'pending';
    ELSIF reject_votes > approve_votes THEN
      UPDATE requests
      SET status = 'rejected'
      WHERE id = NEW.request_id AND status = 'pending';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic status updates
CREATE TRIGGER update_request_status_trigger
  AFTER INSERT ON votes
  FOR EACH ROW
  EXECUTE FUNCTION update_request_status();