-- Enable Row Level Security on the actual profiles table in app schema
ALTER TABLE app.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own profile
CREATE POLICY "Users can view their own profile" 
ON app.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Policy: Users can only insert their own profile (for initial creation)
CREATE POLICY "Users can insert their own profile" 
ON app.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Policy: Users can only update their own profile
CREATE POLICY "Users can update their own profile" 
ON app.profiles 
FOR UPDATE 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);

-- Policy: Users can delete their own profile
CREATE POLICY "Users can delete their own profile" 
ON app.profiles 
FOR DELETE 
USING (auth.uid() = id);