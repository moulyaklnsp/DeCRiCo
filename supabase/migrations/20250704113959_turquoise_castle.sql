/*
  # Create donations table for donation platform

  1. New Tables
    - `donations`
      - `id` (uuid, primary key)
      - `request_id` (uuid, foreign key)
      - `donor_id` (uuid, foreign key)
      - `amount` (numeric)
      - `transaction_hash` (text)
      - `status` (text, check constraint)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `donations` table
    - Add policies for donation access control
    - Update request amount_raised when donation is completed
*/

-- Create donations table
CREATE TABLE IF NOT EXISTS donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  donor_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount numeric NOT NULL CHECK (amount > 0),
  transaction_hash text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Donors can read own donations"
  ON donations
  FOR SELECT
  TO authenticated
  USING (donor_id = auth.uid());

CREATE POLICY "Requesters can read donations to their requests"
  ON donations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM requests 
      WHERE id = request_id 
      AND requester_id = auth.uid()
    )
  );

CREATE POLICY "Admins can read all donations"
  ON donations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "Donors can insert own donations"
  ON donations
  FOR INSERT
  TO authenticated
  WITH CHECK (donor_id = auth.uid());

CREATE POLICY "Admins can update donation status"
  ON donations
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Function to update request amount_raised when donation is completed
CREATE OR REPLACE FUNCTION update_request_amount_raised()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE requests
    SET amount_raised = amount_raised + NEW.amount
    WHERE id = NEW.request_id;
    
    -- Check if request is fully funded
    UPDATE requests
    SET status = 'completed'
    WHERE id = NEW.request_id 
    AND amount_raised >= amount_needed 
    AND status = 'approved';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating request amount_raised
CREATE TRIGGER update_request_amount_raised_trigger
  AFTER UPDATE ON donations
  FOR EACH ROW
  EXECUTE FUNCTION update_request_amount_raised();