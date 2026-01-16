#!/bin/bash
set -e

echo "==> Populating AWS Secrets Manager"
echo "================================="
echo ""

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    echo "[!] ERROR: AWS CLI not found"
    exit 1
fi

# Function to update secret
update_secret() {
    local secret_id=$1
    local secret_name=$2
    
    read -sp "Enter $secret_name: " secret_value
    echo ""
    
    if [ -n "$secret_value" ]; then
        aws secretsmanager put-secret-value \
            --secret-id "$secret_id" \
            --secret-string "$secret_value"
        echo "[+] $secret_name updated"
    else
        echo "[!] Skipped $secret_name (empty value)"
    fi
    echo ""
}

echo "This script will help you populate secrets in AWS Secrets Manager."
echo "Press Enter to skip any secret."
echo ""

# OpenRouter API Key
update_secret "pixorly/openrouter-api-key" "OpenRouter API Key"

# Clerk Secret Key
update_secret "pixorly/clerk-secret-key" "Clerk Secret Key"

# Stripe Secret Key
update_secret "pixorly/stripe-secret-key" "Stripe Secret Key"

# Stripe Webhook Secret
update_secret "pixorly/stripe-webhook-secret" "Stripe Webhook Secret"

# Convex Deploy Key
update_secret "pixorly/convex-deploy-key" "Convex Deploy Key"

# CloudFront Private Key
cd "$(dirname "$0")/../terraform"
if [ -f "cloudfront-private-key.pem" ]; then
    echo "Uploading CloudFront private key..."
    aws secretsmanager put-secret-value \
        --secret-id "pixorly/cloudfront-private-key" \
        --secret-string "file://cloudfront-private-key.pem"
    echo "[+] CloudFront private key uploaded"
else
    echo "[!] CloudFront private key not found"
fi

echo ""
echo "[+] Secrets populated successfully!"
echo ""
echo "To retrieve a secret:"
echo "aws secretsmanager get-secret-value --secret-id pixorly/openrouter-api-key --query SecretString --output text"
