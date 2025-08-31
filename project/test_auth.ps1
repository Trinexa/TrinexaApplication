# PowerShell script to test Supabase authentication
# This will help us verify if the issue is with the user creation or the login process

$supabaseUrl = "https://aylbhudsotlywossqbkc.supabase.co"
$supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5bGJodWRzb3RseXdvc3NxYmtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0MjMwNzQsImV4cCI6MjA2ODk5OTA3NH0.7uMdkHINmhDmuzDDSMxljoAEF38Y5-4oh8YAbDMjxw4"

# Test 1: Try to sign in with the admin credentials
$loginBody = @{
    email = "admin@trinexa.com"
    password = "Admin123!@#"
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
    "apikey" = $supabaseKey
    "Authorization" = "Bearer $supabaseKey"
}

Write-Host "Testing login with PowerShell..." -ForegroundColor Yellow
Write-Host "URL: $supabaseUrl/auth/v1/token?grant_type=password" -ForegroundColor Cyan
Write-Host "Body: $loginBody" -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "$supabaseUrl/auth/v1/token?grant_type=password" -Method POST -Body $loginBody -Headers $headers
    Write-Host "✅ LOGIN SUCCESS!" -ForegroundColor Green
    Write-Host "User ID: $($response.user.id)" -ForegroundColor Green
    Write-Host "Email: $($response.user.email)" -ForegroundColor Green
    Write-Host "Access Token: $($response.access_token.Substring(0, 20))..." -ForegroundColor Green
}
catch {
    Write-Host "❌ LOGIN FAILED!" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    # Try to get more details from the response
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody" -ForegroundColor Red
    }
}

Write-Host "`n" -ForegroundColor White
Write-Host "If login failed, try these steps:" -ForegroundColor Yellow
Write-Host "1. Run debug_user_issue.sql in Supabase SQL Editor" -ForegroundColor White
Write-Host "2. Run force_create_user.sql if needed" -ForegroundColor White
Write-Host "3. Check if signup is enabled in your Supabase dashboard" -ForegroundColor White
Write-Host "4. Try creating the user manually in Supabase Auth dashboard" -ForegroundColor White
