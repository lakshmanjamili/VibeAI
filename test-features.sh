#!/bin/bash

# VibeAI Feature Testing Script
# Run this to quickly verify all features are working

echo "🧪 VibeAI Feature Testing Suite"
echo "================================"
echo ""

PORT=3004
BASE_URL="http://localhost:$PORT"

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to test a route
test_route() {
    local route=$1
    local expected=$2
    local description=$3
    
    status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$route")
    
    if [ "$status" = "$expected" ]; then
        echo -e "${GREEN}✓${NC} $description (Status: $status)"
    else
        echo -e "${RED}✗${NC} $description (Expected: $expected, Got: $status)"
    fi
}

echo "1️⃣  Testing Public Routes"
echo "--------------------------"
test_route "/" "200" "Home page"
test_route "/gallery" "200" "Gallery page"
test_route "/upload" "200" "Upload page"
test_route "/top-likes" "200" "Top Likes page"
test_route "/weekly-best" "200" "Weekly Best page"
test_route "/sign-in" "200" "Sign In page"
test_route "/sign-up" "200" "Sign Up page"
echo ""

echo "2️⃣  Testing Protected Routes"
echo "-----------------------------"
test_route "/dashboard" "307" "Dashboard (should redirect when not authenticated)"
echo ""

echo "3️⃣  Testing Dynamic Routes"
echo "---------------------------"
test_route "/post/test-id" "200" "Post detail page"
test_route "/user/test-id" "200" "User profile page"
echo ""

echo "4️⃣  Testing API Endpoints"
echo "--------------------------"
test_route "/api/vote" "405" "Vote API (expects POST)"
echo ""

echo "5️⃣  Testing 404 Pages"
echo "----------------------"
test_route "/non-existent-page" "404" "Non-existent page"
test_route "/api/non-existent" "404" "Non-existent API"
echo ""

echo "================================"
echo "📊 Testing Complete!"
echo ""
echo "Next Steps:"
echo "1. Open $BASE_URL in your browser"
echo "2. Test each feature manually using TEST_ALL_FEATURES.md"
echo "3. Check browser console for any errors"
echo "4. Verify Supabase connection in Network tab"
echo ""
echo "Key Features to Test Manually:"
echo "• Like/Unlike posts (anonymous)"
echo "• Post comments (anonymous & signed in)"
echo "• Upload files (all 4 categories)"
echo "• Download files"
echo "• View count tracking"
echo "• Search and filters in gallery"
echo "• User authentication flow"
echo "• Dashboard analytics (after sign in)"