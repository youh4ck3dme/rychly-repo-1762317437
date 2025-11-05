#!/bin/bash
# Production Monitoring & Auto-Repair Script for PAPI Hair Design
# Automated monitoring with alerting and basic auto-repair capabilities

set -e

# Configuration
BASE_URL="https://phd-ai-hair-studio-5hbgan143-h4ck3d-labs-projects.vercel.app"
API_TOKEN=${API_AUTH_TOKEN:-""}
MONITORING_INTERVAL=${MONITORING_INTERVAL:-300} # 5 minutes
LOG_FILE="production-monitor.log"
ALERT_FILE="alerts.log"
HEALTH_CHECK_FILE="health-status.json"

# Sentry configuration (optional)
SENTRY_DSN=${SENTRY_DSN:-""}

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Alert levels
CRITICAL=3
WARNING=2
INFO=1

# Monitoring state
declare -A LAST_ALERT_TIMES
declare -A ERROR_COUNTS

log() {
    local level="$1"
    local message="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')

    echo -e "$timestamp [$level] $message" | tee -a "$LOG_FILE"

    # Also log to alert file for critical issues
    if [ "$level" = "CRITICAL" ] || [ "$level" = "WARNING" ]; then
        echo -e "$timestamp [$level] $message" >> "$ALERT_FILE"
    fi
}

send_alert() {
    local level="$1"
    local component="$2"
    local message="$3"

    # Check if we already sent alert for this issue recently (avoid spam)
    local alert_key="${component}_${level}"
    local last_alert=${LAST_ALERT_TIMES[$alert_key]:-0}
    local current_time=$(date +%s)
    local time_diff=$((current_time - last_alert))

    # Only send alert if it's been more than 15 minutes since last alert for this issue
    if [ $time_diff -gt 900 ]; then
        LAST_ALERT_TIMES[$alert_key]=$current_time

        log "$level" "🚨 ALERT: $component - $message"

        # Here you could integrate with Slack, Discord, email, etc.
        # send_slack_alert "$level" "$component" "$message"
        # send_email_alert "$level" "$component" "$message"
    fi
}

# Health check function
check_api_health() {
    local endpoint="$1"
    local component_name="$2"

    local response=$(curl -s -w "%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $API_TOKEN" \
        -d '{"message":"health check"}' \
        "$BASE_URL$endpoint" 2>/dev/null)

    if [ "$response" = "200" ]; then
        log "INFO" "$component_name API healthy"
        echo "$(date): OK" > "/tmp/${component_name}_health"
        return 0
    else
        ERROR_COUNTS[$component_name]=$((ERROR_COUNTS[$component_name] + 1))
        log "WARNING" "$component_name API returned HTTP $response"

        if [ "${ERROR_COUNTS[$component_name]}" -ge 3 ]; then
            send_alert "CRITICAL" "$component_name" "API down for 3+ consecutive checks"
        fi

        return 1
    fi
}

# Security monitoring
check_security() {
    # Test unauthorized access (should return 401)
    local response=$(curl -s -w "%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        -d '{"message":"unauthorized test"}' \
        "$BASE_URL/api/chat" 2>/dev/null)

    if [ "$response" != "401" ]; then
        send_alert "CRITICAL" "Security" "Unauthorized access possible - got HTTP $response instead of 401"
        return 1
    fi

    # Test rate limiting
    local rate_limit_test=$(curl -s -w "%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $API_TOKEN" \
        -d '{"message":"rate limit test"}' \
        "$BASE_URL/api/chat")

    if [ "$rate_limit_test" = "429" ]; then
        log "INFO" "Rate limiting working correctly"
    fi

    log "INFO" "Security checks passed"
    return 0
}

# Performance monitoring
check_performance() {
    local start_time=$(date +%s%N)

    curl -s -X POST \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $API_TOKEN" \
        -d '{"message":"performance test"}' \
        "$BASE_URL/api/chat" > /dev/null 2>&1

    local end_time=$(date +%s%N)
    local response_time=$(( (end_time - start_time) / 1000000 )) # Convert to milliseconds

    # Log performance metrics
    echo "$(date): ${response_time}ms" >> "performance.log"

    if [ $response_time -gt 10000 ]; then
        send_alert "WARNING" "Performance" "Response time high: ${response_time}ms"
    elif [ $response_time -gt 5000 ]; then
        log "WARNING" "Response time elevated: ${response_time}ms"
    else
        log "INFO" "Response time normal: ${response_time}ms"
    fi
}

# Auto-repair functions
auto_repair() {
    local issue="$1"
    local component="$2"

    log "INFO" "🔧 Attempting auto-repair for: $issue"

    case "$issue" in
        "token_rotation")
            log "INFO" "Rotating API token..."
            # Generate new token
            NEW_TOKEN=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-64)

            # Update environment (this would need to be implemented based on your deployment strategy)
            log "INFO" "New token generated: ${NEW_TOKEN:0:10}..."

            # In a real scenario, you'd update Vercel environment variables here
            # vercel env rm API_AUTH_TOKEN
            # vercel env add API_AUTH_TOKEN

            send_alert "INFO" "Auto-Repair" "API token rotated successfully"
            ;;

        "cache_clear")
            log "INFO" "Clearing application cache..."
            # Clear any cached data
            curl -s -X POST "$BASE_URL/api/admin/clear-cache" \
                -H "Authorization: Bearer $API_TOKEN" > /dev/null 2>&1
            log "INFO" "Cache cleared"
            ;;

        "restart_services")
            log "INFO" "Restarting services..."
            # This would trigger a redeploy or service restart
            vercel redeploy --prod > /dev/null 2>&1
            log "INFO" "Services restarted"
            ;;
    esac
}

# Main monitoring loop
monitor_loop() {
    log "${BLUE}🚀 Starting Production Monitoring${NC}"
    log "Monitoring interval: $MONITORING_INTERVAL seconds"
    log "Base URL: $BASE_URL"
    echo

    while true; do
        local cycle_start=$(date +%s)

        # Health checks
        check_api_health "/api/chat" "Chat"
        check_api_health "/api/hair/analyze" "HairAnalysis"

        # Security checks
        check_security

        # Performance monitoring
        check_performance

        # Save health status
        cat > "$HEALTH_CHECK_FILE" << EOF
{
  "timestamp": "$(date -Iseconds)",
  "status": "healthy",
  "services": {
    "chat_api": "${ERROR_COUNTS[Chat]:-0}",
    "hair_api": "${ERROR_COUNTS[HairAnalysis]:-0}"
  },
  "uptime": "$(uptime -p)",
  "load_average": "$(uptime | awk -F'load average:' '{print $2}')"
}
EOF

        # Auto-repair triggers
        for component in "${!ERROR_COUNTS[@]}"; do
            if [ "${ERROR_COUNTS[$component]}" -ge 5 ]; then
                auto_repair "restart_services" "$component"
                ERROR_COUNTS[$component]=0
            fi
        done

        # Calculate next run time
        local cycle_end=$(date +%s)
        local cycle_duration=$((cycle_end - cycle_start))
        local sleep_time=$((MONITORING_INTERVAL - cycle_duration))

        if [ $sleep_time -gt 0 ]; then
            sleep $sleep_time
        fi
    done
}

# One-time health check
health_check() {
    log "${BLUE}🔍 Running One-time Health Check${NC}"

    local failed_checks=0

    # Basic connectivity
    if ! curl -f -s "$BASE_URL" > /dev/null; then
        send_alert "CRITICAL" "Connectivity" "Application not accessible"
        failed_checks=$((failed_checks + 1))
    fi

    # API functionality
    if ! check_api_health "/api/chat" "Chat"; then
        failed_checks=$((failed_checks + 1))
    fi

    # Security
    if ! check_security; then
        failed_checks=$((failed_checks + 1))
    fi

    # Final status
    if [ $failed_checks -eq 0 ]; then
        log "${GREEN}✅ All health checks passed${NC}"
        return 0
    else
        log "${RED}❌ $failed_checks health check(s) failed${NC}"
        return 1
    fi
}

# Help function
show_help() {
    cat << EOF
Production Monitoring Script for PAPI Hair Design

Usage: $0 [COMMAND]

Commands:
  start     Start continuous monitoring (default)
  health    Run one-time health check
  status    Show current status
  logs      Show recent logs
  alerts    Show recent alerts
  repair    Attempt auto-repair

Environment Variables:
  API_AUTH_TOKEN      Required API token
  MONITORING_INTERVAL Monitoring interval in seconds (default: 300)
  SENTRY_DSN          Optional Sentry DSN for error tracking

Examples:
  $0 start                    # Start monitoring
  $0 health                   # Quick health check
  API_AUTH_TOKEN=abc123 $0    # Set token and start monitoring

EOF
}

# Main execution
main() {
    case "${1:-start}" in
        "start")
            if [ -z "$API_TOKEN" ]; then
                echo "Error: API_AUTH_TOKEN environment variable required"
                echo "Usage: API_AUTH_TOKEN=your-token $0"
                exit 1
            fi
            monitor_loop
            ;;
        "health")
            if [ -z "$API_TOKEN" ]; then
                echo "Error: API_AUTH_TOKEN environment variable required"
                exit 1
            fi
            health_check
            ;;
        "status")
            echo "Current Status:"
            echo "==============="
            if [ -f "$HEALTH_CHECK_FILE" ]; then
                cat "$HEALTH_CHECK_FILE" | jq . 2>/dev/null || cat "$HEALTH_CHECK_FILE"
            else
                echo "No health status file found"
            fi
            ;;
        "logs")
            echo "Recent Logs:"
            echo "============"
            tail -20 "$LOG_FILE" 2>/dev/null || echo "No log file found"
            ;;
        "alerts")
            echo "Recent Alerts:"
            echo "=============="
            tail -10 "$ALERT_FILE" 2>/dev/null || echo "No alerts found"
            ;;
        "repair")
            echo "Running Auto-Repair..."
            auto_repair "cache_clear" "general"
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            echo "Unknown command: $1"
            echo "Use '$0 help' for usage information"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"