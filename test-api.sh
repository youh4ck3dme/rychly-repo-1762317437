#!/bin/bash
# API Testing Script for PAPI Hair Design
# Tests both functionality and security of API endpoints

set -e

# Configuration
BASE_URL="https://phd-ai-hair-studio-5hbgan143-h4ck3d-labs-projects.vercel.app"
API_TOKEN=${API_AUTH_TOKEN:-"your-test-token"}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Test result functions
print_test() {
    echo -e "${YELLOW}🧪 $1${NC}"
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
}

print_success() {
    echo -e "  ${GREEN}✅ $1${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
}

print_error() {
    echo -e "  ${RED}❌ $1${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
}

print_warning() {
    echo -e "  ${YELLOW}⚠️ $1${NC}"
}

# API test function
api_test() {
    local method=$1
    local endpoint=$2
    local data=$3
    local expected_status=${4:-200}
    local description=$5

    print_test "$description"

    local response
    local http_code

    if [ "$method" = "POST" ]; then
        response=$(curl -s -w "\n%{http_code}" \
            -X POST \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $API_TOKEN" \
            -d "$data" \
            "$BASE_URL$endpoint" 2>/dev/null)
    else
        response=$(curl -s -w "\n%{http_code}" \
            -X GET \
            "$BASE_URL$endpoint" 2>/dev/null)
    fi

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)

    if [ "$http_code" = "$expected_status" ]; then
        print_success "HTTP $http_code (očakávané)"
        echo "    Response: $body"
    else
        print_error "HTTP $http_code (očakávané: $expected_status)"
        echo "    Response: $body"
    fi
}

# Security test function
security_test() {
    local method=$1
    local endpoint=$2
    local data=$3
    local expected_status=$4
    local description=$5

    print_test "$description"

    local response
    local http_code

    if [ "$method" = "POST" ]; then
        response=$(curl -s -w "\n%{http_code}" \
            -X POST \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$BASE_URL$endpoint" 2>/dev/null)
    else
        response=$(curl -s -w "\n%{http_code}" \
            -X GET \
            "$BASE_URL$endpoint" 2>/dev/null)
    fi

    http_code=$(echo "$response" | tail -n1)

    if [ "$http_code" = "$expected_status" ]; then
        print_success "Bezpečnosť OK - HTTP $http_code"
    else
        print_error "Bezpečnosť problém - HTTP $http_code (očakávané: $expected_status)"
    fi
}

echo "🚀 PAPI Hair Design - API Test Suite"
echo "===================================="

# Functional Tests
echo
echo "🔧 FUNKČNÉ TESTY"
echo "================"

# Chat API Tests
api_test "POST" "/api/chat" '{"message":"Ahoj, ako sa máš?"}' 200 "Chat API základný test"
api_test "POST" "/api/chat" '{"message":"Aký účes by si mi odporučil?"}' 200 "Chat API s otázkou o účese"
api_test "POST" "/api/chat" '{"message":""}' 400 "Chat API s prázdnou správou"

# Hair Analysis Tests
api_test "POST" "/api/hair/analyze" '{"imageUrl":"https://picsum.photos/seed/hair/600"}' 200 "Hair Analysis API test"
api_test "POST" "/api/hair/analyze" '{"imageUrl":""}' 400 "Hair Analysis API s prázdnou URL"
api_test "POST" "/api/hair/analyze" '{}' 400 "Hair Analysis API bez imageUrl"

# Security Tests
echo
echo "🔐 BEZPEČNOSTNÉ TESTY"
echo "==================="

# Authentication Tests
security_test "POST" "/api/chat" '{"message":"test"}' 401 "Neautorizovaný prístup k chat API"
security_test "POST" "/api/hair/analyze" '{"imageUrl":"test"}' 401 "Neautorizovaný prístup k hair analysis API"

# Rate Limiting Test
echo
echo "⚡ RATE LIMITING TEST"
echo "===================="

print_test "Rate limiting test (100 požiadaviek/15min)"
success_count=0
for i in {1..5}; do
    response=$(curl -s -w "%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $API_TOKEN" \
        -d '{"message":"rate limit test"}' \
        "$BASE_URL/api/chat" 2>/dev/null)

    if [ "$response" = "200" ]; then
        success_count=$((success_count + 1))
    fi
done

if [ $success_count -eq 5 ]; then
    print_success "Rate limiting funguje správne"
else
    print_error "Rate limiting problém"
fi

# Input Sanitization Test
echo
echo "🧹 INPUT SANITIZATION TEST"
echo "========================="

print_test "XSS injection test"
xss_response=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $API_TOKEN" \
    -d '{"message":"<script>alert(\"xss\")</script>"}' \
    "$BASE_URL/api/chat")

if echo "$xss_response" | grep -q "script"; then
    print_error "XSS injection možná"
else
    print_success "XSS injection ochránené"
fi

# Performance Tests
echo
echo "⚡ PERFORMANCE TESTY"
echo "==================="

print_test "Response time test"
start_time=$(date +%s%N)
curl -s -X POST \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $API_TOKEN" \
    -d '{"message":"performance test"}' \
    "$BASE_URL/api/chat" > /dev/null
end_time=$(date +%s%N)

response_time=$(( (end_time - start_time) / 1000000 )) # Convert to milliseconds
echo "  Response time: ${response_time}ms"

if [ $response_time -lt 5000 ]; then
    print_success "Response time OK (< 5s)"
else
    print_warning "Response time pomalá (> 5s)"
fi

# Summary
echo
echo "📊 VÝSLEDKY TESTOV"
echo "=================="
echo "Celkovo testov: $TOTAL_TESTS"
echo -e "Úspešné: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Neúspešné: ${RED}$FAILED_TESTS${NC}"

success_rate=$((PASSED_TESTS * 100 / TOTAL_TESTS))
echo "Úspešnosť: ${success_rate}%"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}🎉 Všetky testy prešli! Projekt je pripravený na produkciu.${NC}"
    exit 0
else
    echo -e "${RED}⚠️ Niektoré testy zlyhali. Skontrolujte konfiguráciu.${NC}"
    exit 1
fi