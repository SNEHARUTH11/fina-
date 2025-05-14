/*
  # Create user data tables

  1. New Tables
    - `user_watchlists`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `asset_id` (text)
      - `created_at` (timestamp)
    
    - `user_alerts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `asset_id` (text)
      - `price` (numeric)
      - `condition` (text)
      - `triggered` (boolean)
      - `created_at` (timestamp)
    
    - `user_settings`
      - `user_id` (uuid, primary key, references auth.users)
      - `theme` (text)
      - `default_timeframe` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create user_watchlists table
CREATE TABLE IF NOT EXISTS user_watchlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  asset_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, asset_id)
);

-- Create user_alerts table
CREATE TABLE IF NOT EXISTS user_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  asset_id text NOT NULL,
  price numeric NOT NULL,
  condition text NOT NULL,
  triggered boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  user_id uuid PRIMARY KEY REFERENCES auth.users,
  theme text DEFAULT 'dark',
  default_timeframe text DEFAULT '15m',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE user_watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for user_watchlists
CREATE POLICY "Users can manage their own watchlist"
  ON user_watchlists
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for user_alerts
CREATE POLICY "Users can manage their own alerts"
  ON user_alerts
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for user_settings
CREATE POLICY "Users can manage their own settings"
  ON user_settings
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);