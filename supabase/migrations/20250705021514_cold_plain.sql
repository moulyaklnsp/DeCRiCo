/*
  # Add wallet_address column to users table

  1. Changes
    - Add wallet_address column to users table if it doesn't exist
    - This allows users to store their wallet address for receiving donations

  2. Security
    - No changes to RLS policies needed
    - Users can update their own wallet address
*/

-- Add wallet_address column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'wallet_address'
  ) THEN
    ALTER TABLE users ADD COLUMN wallet_address text;
  END IF;
END $$;