@echo off
echo Testing Supabase Authentication...
echo.

curl -X POST "https://aylbhudsotlywossqbkc.supabase.co/auth/v1/token?grant_type=password" ^
  -H "Content-Type: application/json" ^
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5bGJodWRzb3RseXdvc3NxYmtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0MjMwNzQsImV4cCI6MjA2ODk5OTA3NH0.7uMdkHINmhDmuzDDSMxljoAEF38Y5-4oh8YAbDMjxw4" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5bGJodWRzb3RseXdvc3NxYmtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0MjMwNzQsImV4cCI6MjA2ODk5OTA3NH0.7uMdkHINmhDmuzDDSMxljoAEF38Y5-4oh8YAbDMjxw4" ^
  -d "{\"email\":\"admin@trinexa.com\",\"password\":\"Admin123!@#\"}"

echo.
echo.
echo If you see a success response above, the user exists and credentials work.
echo If you see an error, the user doesn't exist or credentials are wrong.
echo.
pause
