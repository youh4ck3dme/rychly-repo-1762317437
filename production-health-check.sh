#!/bin/bash
# Production Health Check for PAPI Hair Design
# Comprehensive monitoring script for security and functionality

set -e

# Configuration
BASE_URL="https://phd-ai-hair-studio-5hbgan143-h4ck3d-labs-projects.vercel.app"
API_TOKEN=${API_AUTH_TOKEN:-""}
LOG_FILE="health-check-$(date +%Y%m%d-%H%M%S).log"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging function
log() {
    echo -e "$(date '+%Y-%m-%d %H:%M:%S') $1" | tee -a "$LOG_FILE"
}

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
WARNINGS=0

# Test functions
run_test() {
    local test_name="$1"
    local test_function="$2"

    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    log "${BLUE}🧪 Running: $test_name${NC}"

    if $test_function; then
        PASSED_TESTS=$((PASSED_TESTS + 1))
        log "${GREEN}✅ PASSED: $test_name${NC}"
    else
        FAILED_TESTS=$((FAILED_TESTS + 1))
        log "${RED}❌ FAILED: $test_name${NC}"
    fi
}

run_warning() {
    local warning="$1"
    WARNINGS=$((WARNINGS + 1))
    log "${YELLOW}⚠️ WARNING: $warning${NC}"
}

# Security Tests
test_authentication() {
    local response=$(curl -s -w "%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        -d '{"message":"health check"}' \
        "$BASE_URL/api/chat" 2>/dev/null)

    [ "$response" = "401" ]
}

test_rate_limiting() {
    local success_count=0

    # Make multiple requests quickly
    for i in {1..5}; do
        local response=$(curl -s -w "%{http_code}" -X POST \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $API_TOKEN" \
            -d '{"message":"rate test"}' \
            "$BASE_URL/api/chat" 2>/dev/null)

        if [ "$response" = "200" ]; then
            success_count=$((success_count + 1))
        fi
    done

    # Should allow some requests but not all (rate limiting active)
    [ $success_count -gt 0 ] && [ $success_count -lt 5 ]
}

test_input_sanitization() {
    local response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $API_TOKEN" \
        -d '{"message":"<script>alert(\"xss\")</script>"}' \
        "$BASE_URL/api/chat")

    # Check if script tag is present in response (should be sanitized)
    ! echo "$response" | grep -q "<script>"
}

test_security_headers() {
    local headers=$(curl -s -I "$BASE_URL" | grep -E "(X-Content-Type-Options|X-Frame-Options|X-XSS-Protection)")

    echo "$headers" | grep -q "nosniff" && \
    echo "$headers" | grep -q "DENY" && \
    echo "$headers" | grep -q "mode=block"
}

# Functionality Tests
test_chat_api() {
    local response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $API_TOKEN" \
        -d '{"message":"Ahoj, ako sa máš?"}' \
        "$BASE_URL/api/chat")

    echo "$response" | grep -q "reply"
}

test_hair_analysis_api() {
    local response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $API_TOKEN" \
        -d '{"imageUrl":"https://picsum.photos/seed/hair/600"}' \
        "$BASE_URL/api/hair/analyze")

    echo "$response" | grep -q "summary"
}

test_response_time() {
    local start_time=$(date +%s%N)
    curl -s -X POST \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $API_TOKEN" \
        -d '{"message":"performance test"}' \
        "$BASE_URL/api/chat" > /dev/null
    local end_time=$(date +%s%N)

    local response_time=$(( (end_time - start_time) / 1000000 )) # Convert to milliseconds

    [ $response_time -lt 10000 ] # Should respond within 10 seconds
}

test_environment_variables() {
    # Check if required env vars are set
    [ -n "$API_TOKEN" ] && \
    [ -n "$BASE_URL" ] && \
    curl -f -s "$BASE_URL" > /dev/null
}

# Attack Simulation Tests
test_xss_attack() {
    local xss_payloads=(
        "<script>alert('xss')</script>"
        "javascript:alert('xss')"
        "<img src=x onerror=alert('xss')>"
        "<svg onload=alert('xss')>"
    )

    for payload in "${xss_payloads[@]}"; do
        local response=$(curl -s -X POST \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $API_TOKEN" \
            -d "{\"message\":\"$payload\"}" \
            "$BASE_URL/api/chat")

        # If we can find the payload in response, sanitization failed
        if echo "$response" | grep -q "$payload"; then
            return 1
        fi
    done

    return 0
}

test_brute_force_simulation() {
    local failed_attempts=0

    # Try multiple invalid tokens
    for i in {1..3}; do
        local response=$(curl -s -w "%{http_code}" -X POST \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer invalid-token-$i" \
            -d '{"message":"brute force test"}' \
            "$BASE_URL/api/chat")

        if [ "$response" = "401" ]; then
            failed_attempts=$((failed_attempts + 1))
        fi
    done

    [ $failed_attempts -eq 3 ]
}

test_dos_simulation() {
    local start_time=$(date +%s)
    local request_count=0

    # Make many requests quickly to test rate limiting
    for i in {1..20}; do
        curl -s -X POST \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $API_TOKEN" \
            -d '{"message":"dos test"}' \
            "$BASE_URL/api/chat" > /dev/null 2>&1 &
        request_count=$((request_count + 1))
    done

    wait

    # Check if we get rate limited (some requests should fail)
    local rate_limited_requests=$(curl -s -w "%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $API_TOKEN" \
        -d '{"message":"rate limit check"}' \
        "$BASE_URL/api/chat" | grep -c "429" || true)

    [ $rate_limited_requests -gt 0 ]
}

# Main execution
main() {
    log "${BLUE}🚀 PAPI Hair Design - Production Health Check${NC}"
    log "${BLUE}=============================================${NC}"
    log "Base URL: $BASE_URL"
    log "Timestamp: $(date)"
    log "Environment: ${NODE_ENV:-'unknown'}"
    echo

    # Environment Check
    if [ -z "$API_TOKEN" ]; then
        run_warning "API_AUTH_TOKEN not set - some tests will be skipped"
    fi

    # Security Tests
    log "${YELLOW}🔐 SECURITY TESTS${NC}"
    log "================"

    run_test "Authentication Required" test_authentication
    run_test "Rate Limiting Active" test_rate_limiting
    run_test "Input Sanitization" test_input_sanitization
    run_test "Security Headers Present" test_security_headers

    # Functionality Tests
    log "${YELLOW}🔧 FUNCTIONALITY TESTS${NC}"
    log "===================="

    if [ -n "$API_TOKEN" ]; then
        run_test "Chat API Functional" test_chat_api
        run_test "Hair Analysis API Functional" test_hair_analysis_api
        run_test "Response Time < 10s" test_response_time
    fi

    run_test "Environment Variables Set" test_environment_variables

    # Attack Simulation Tests
    log "${YELLOW}⚔️ ATTACK SIMULATION TESTS${NC}"
    log "========================="

    if [ -n "$API_TOKEN" ]; then
        run_test "XSS Attack Prevention" test_xss_attack
        run_test "Brute Force Protection" test_brute_force_simulation
        run_test "DoS Protection" test_dos_simulation
    fi

    # Summary
    echo
    log "${BLUE}📊 HEALTH CHECK SUMMARY${NC}"
    log "======================"
    log "Total Tests: $TOTAL_TESTS"
    log "Passed: ${GREEN}$PASSED_TESTS${NC}"
    log "Failed: ${RED}$FAILED_TESTS${NC}"
    log "Warnings: ${YELLOW}$WARNINGS${NC}"

    local success_rate=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    log "Success Rate: ${success_rate}%"

    # Final assessment
    echo
    if [ $FAILED_TESTS -eq 0 ]; then
        log "${GREEN}🎉 PRODUCTION READY! All tests passed.${NC}"
        return 0
    elif [ $success_rate -ge 80 ]; then
        log "${YELLOW}⚠️ MOSTLY READY! Minor issues detected.${NC}"
        return 0
    else
        log "${RED}❌ NOT READY! Critical issues found.${NC}"
        return 1
    fi
}

# Run main function
main "$@"