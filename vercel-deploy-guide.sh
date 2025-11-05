#!/bin/bash
# Vercel Deployment Guide for PAPI Hair Design
# Automated deployment script with security best practices

set -e

# Configuration
PROJECT_NAME="phd-ai-hair-studio"
PRODUCTION_URL="https://phd-ai-hair-studio-5hbgan143-h4ck3d-labs-projects.vercel.app"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() {
    echo -e "$(date '+%Y-%m-%d %H:%M:%S') $1"
}

# Pre-deployment checklist
pre_deployment_check() {
    log "${BLUE}🔍 Pre-deployment Security Check${NC}"

    # Check required environment variables
    local required_vars=("OPENAI_API_KEY" "API_AUTH_TOKEN" "NODE_ENV")
    local missing_vars=()

    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done

    if [ ${#missing_vars[@]} -ne 0 ]; then
        log "${RED}❌ Missing required environment variables: ${missing_vars[*]}${NC}"
        return 1
    fi

    # Check API token strength
    if [ ${#API_AUTH_TOKEN} -lt 32 ]; then
        log "${RED}❌ API_AUTH_TOKEN is too weak (minimum 32 characters)${NC}"
        return 1
    fi

    # Test build locally
    log "Building project locally..."
    if ! npm run build; then
        log "${RED}❌ Local build failed${NC}"
        return 1
    fi

    log "${GREEN}✅ Pre-deployment check passed${NC}"
    return 0
}

# Vercel deployment
deploy_to_vercel() {
    log "${BLUE}🚀 Deploying to Vercel${NC}"

    # Check if logged in to Vercel
    if ! vercel whoami > /dev/null 2>&1; then
        log "Please log in to Vercel:"
        vercel login
    fi

    # Set environment variables in Vercel
    log "Setting environment variables in Vercel..."

    vercel env add OPENAI_API_KEY production
    vercel env add API_AUTH_TOKEN production
    vercel env add NODE_ENV production

    # Deploy to production
    log "Deploying to production..."
    vercel --prod

    # Get deployment URL
    local deployment_url=$(vercel ls --scope="$PROJECT_NAME" --prod | grep "$PROJECT_NAME" | awk '{print $2}' | head -n 1)

    if [ -n "$deployment_url" ]; then
        log "${GREEN}✅ Deployment successful: $deployment_url${NC}"
    else
        log "${RED}❌ Failed to get deployment URL${NC}"
        return 1
    fi
}

# Post-deployment verification
post_deployment_verification() {
    log "${BLUE}🔍 Post-deployment Verification${NC}"

    local test_url="$PRODUCTION_URL"

    # Test basic connectivity
    if ! curl -f -s "$test_url" > /dev/null; then
        log "${RED}❌ Application not accessible at $test_url${NC}"
        return 1
    fi

    # Test API endpoints
    local chat_response=$(curl -s -w "%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $API_AUTH_TOKEN" \
        -d '{"message":"deployment test"}' \
        "$test_url/api/chat")

    if [ "$chat_response" != "200" ]; then
        log "${RED}❌ Chat API not working (HTTP $chat_response)${NC}"
        return 1
    fi

    # Test security headers
    local security_headers=$(curl -s -I "$test_url" | grep -c "X-Content-Type-Options\|X-Frame-Options\|X-XSS-Protection" || true)

    if [ "$security_headers" -lt 3 ]; then
        log "${YELLOW}⚠️ Some security headers missing ($security_headers/3 present)${NC}"
    else
        log "${GREEN}✅ All security headers present${NC}"
    fi

    log "${GREEN}✅ Post-deployment verification passed${NC}"
}

# Monitoring setup
setup_monitoring() {
    log "${BLUE}📊 Setting up Monitoring${NC}"

    # Create monitoring script
    cat > monitor-production.sh << 'EOF'
#!/bin/bash
# Production Monitoring Script

BASE_URL="https://phd-ai-hair-studio-5hbgan143-h4ck3d-labs-projects.vercel.app"
API_TOKEN="${API_AUTH_TOKEN}"

# Health check
health_response=$(curl -s -w "%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $API_TOKEN" \
    -d '{"message":"health check"}' \
    "$BASE_URL/api/chat")

if [ "$health_response" = "200" ]; then
    echo "$(date): ✅ Production API healthy"
else
    echo "$(date): ❌ Production API down (HTTP $health_response)"
fi
EOF

    chmod +x monitor-production.sh

    log "${GREEN}✅ Monitoring script created${NC}"
    log "Run with: ./monitor-production.sh"
}

# Main deployment process
main() {
    log "${BLUE}🚀 PAPI Hair Design - Automated Deployment${NC}"
    log "${BLUE}=========================================${NC}"

    # Pre-deployment checks
    if ! pre_deployment_check; then
        log "${RED}❌ Pre-deployment checks failed. Aborting.${NC}"
        exit 1
    fi

    # Deploy to Vercel
    if ! deploy_to_vercel; then
        log "${RED}❌ Deployment failed${NC}"
        exit 1
    fi

    # Post-deployment verification
    if ! post_deployment_verification; then
        log "${YELLOW}⚠️ Deployment completed but verification had issues${NC}"
        log "Please check manually at: $PRODUCTION_URL"
    fi

    # Setup monitoring
    setup_monitoring

    # Final instructions
    echo
    log "${GREEN}🎉 Deployment completed successfully!${NC}"
    log "Production URL: $PRODUCTION_URL"
    echo
    log "${YELLOW}📋 Next Steps:${NC}"
    log "1. Test your application: $PRODUCTION_URL"
    log "2. Run security tests: ./test-api.sh"
    log "3. Set up monitoring: ./monitor-production.sh"
    log "4. Check Vercel dashboard for analytics"
    echo
    log "${BLUE}🔐 Security Reminder:${NC}"
    log "• API_AUTH_TOKEN: ${API_AUTH_TOKEN:0:10}..."
    log "• Keep tokens secure and rotate regularly"
    log "• Monitor logs in Vercel dashboard"
}

# Run deployment if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi