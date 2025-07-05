/*
  # Update verification logic to approve after 1 verifier approval

  1. Changes
    - Modify the vote trigger function to approve requests after just 1 approval vote
    - Keep rejection requiring majority (more reject than approve votes)
    - Ensure immediate approval when first verifier approves

  2. Security
    - Maintain existing RLS policies
    - Only verifiers and admins can vote
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS update_request_status_trigger ON votes;
DROP FUNCTION IF EXISTS update_request_status();

-- Create new function with updated logic
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

  -- Approve immediately if any verifier approves
  IF approve_votes >= 1 THEN
    UPDATE requests
    SET status = 'approved'
    WHERE id = NEW.request_id AND status = 'pending';
  -- Reject only if more rejections than approvals and at least 1 vote
  ELSIF reject_votes > approve_votes AND total_votes >= 1 THEN
    UPDATE requests
    SET status = 'rejected'
    WHERE id = NEW.request_id AND status = 'pending';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
CREATE TRIGGER update_request_status_trigger
  AFTER INSERT ON votes
  FOR EACH ROW
  EXECUTE FUNCTION update_request_status();