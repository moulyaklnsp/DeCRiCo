/*
  # Add wallet address validation and constraints

  1. Changes
    - Add constraint to prevent same role users from having same wallet address
    - Add function to validate wallet addresses
    - Update existing policies

  2. Security
    - Ensure wallet address uniqueness per role (except admin)
    - Validate Ethereum address format
*/

-- Function to validate Ethereum wallet address format
CREATE OR REPLACE FUNCTION is_valid_ethereum_address(address text)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if address starts with 0x and is 42 characters long
  -- and contains only hexadecimal characters
  RETURN address ~ '^0x[a-fA-F0-9]{40}$';
END;
$$;

-- Function to check wallet address uniqueness per role
CREATE OR REPLACE FUNCTION check_wallet_uniqueness()
RETURNS TRIGGER AS $$
BEGIN
  -- Skip check for admin role
  IF NEW.role = 'admin' THEN
    RETURN NEW;
  END IF;

  -- Check if another user with same role has same wallet address
  IF EXISTS (
    SELECT 1 FROM users 
    WHERE wallet_address = NEW.wallet_address 
    AND role = NEW.role 
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
  ) THEN
    RAISE EXCEPTION 'A % with this wallet address already exists. Same role users cannot share wallet addresses.', NEW.role;
  END IF;

  -- Validate wallet address format if provided
  IF NEW.wallet_address IS NOT NULL AND NOT is_valid_ethereum_address(NEW.wallet_address) THEN
    RAISE EXCEPTION 'Invalid Ethereum wallet address format. Address must start with 0x and be 42 characters long.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for wallet address validation
DROP TRIGGER IF EXISTS wallet_validation_trigger ON users;
CREATE TRIGGER wallet_validation_trigger
  BEFORE INSERT OR UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION check_wallet_uniqueness();