/*
  # Create requests table for donation platform

  1. New Tables
    - `requests`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `amount_needed` (numeric)
      - `amount_raised` (numeric, default 0)
      - `status` (text, check constraint)
      - `requester_id` (uuid, foreign key)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `requests` table
    - Add policies for request access control
*/

-- Create requests table
CREATE TABLE IF NOT EXISTS requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  amount_needed numeric NOT NULL CHECK (amount_needed > 0),
  amount_raised numeric DEFAULT 0 CHECK (amount_raised >= 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  requester_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read approved requests"
  ON requests
  FOR SELECT
  TO authenticated
  USING (status = 'approved');

CREATE POLICY "Requesters can read own requests"
  ON requests
  FOR SELECT
  TO authenticated
  USING (requester_id = auth.uid());

CREATE POLICY "Verifiers and admins can read all requests"
  ON requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('verifier', 'admin')
    )
  );

CREATE POLICY "Requesters can insert own requests"
  ON requests
  FOR INSERT
  TO authenticated
  WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Requesters can update own requests"
  ON requests
  FOR UPDATE
  TO authenticated
  USING (requester_id = auth.uid());

CREATE POLICY "Admins can update all requests"
  ON requests
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete requests"
  ON requests
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Update timestamp trigger
CREATE TRIGGER update_requests_updated_at
  BEFORE UPDATE ON requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();