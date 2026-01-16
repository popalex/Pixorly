#!/bin/bash
set -e

# Navigate to terraform directory
cd "$(dirname "$0")/../terraform"

# Check if terraform outputs exist
if [ ! -f "terraform-outputs.json" ]; then
    echo "[*] Generating terraform outputs..." >&2
    terraform output -json > terraform-outputs.json
fi

# Extract values from Terraform outputs
AWS_ACCESS_KEY_ID=$(terraform output -raw aws_access_key_id)
AWS_SECRET_ACCESS_KEY=$(terraform output -raw aws_secret_access_key)
AWS_REGION=$(terraform output -raw aws_region)
AWS_S3_BUCKET=$(terraform output -raw s3_bucket_name)
CLOUDFRONT_DOMAIN=$(terraform output -raw cloudfront_domain_name)
CLOUDFRONT_DISTRIBUTION_ID=$(terraform output -raw cloudfront_distribution_id)
CLOUDFRONT_KEY_PAIR_ID=$(terraform output -raw cloudfront_public_key_id)

# Generate .env file
cat << EOF
# AWS Configuration (Generated from Terraform)
# Generated on: $(date)
# ⚠️ KEEP THIS FILE SECURE - DO NOT COMMIT TO VERSION CONTROL

# AWS Credentials
AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY
AWS_REGION=$AWS_REGION

# S3 Configuration
AWS_S3_BUCKET=$AWS_S3_BUCKET

# CloudFront Configuration
CLOUDFRONT_DOMAIN=$CLOUDFRONT_DOMAIN
CLOUDFRONT_DISTRIBUTION_ID=$CLOUDFRONT_DISTRIBUTION_ID
CLOUDFRONT_KEY_PAIR_ID=$CLOUDFRONT_KEY_PAIR_ID

# CloudFront Private Key (base64 encoded)
# Note: You need to set this manually from cloudfront-private-key.pem
# CLOUDFRONT_PRIVATE_KEY=\$(cat infrastructure/terraform/cloudfront-private-key.pem | base64)

# API Keys (to be filled manually or from Secrets Manager)
OPENROUTER_API_KEY=
CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Convex
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=

# Application URLs
NEXT_PUBLIC_APP_URL=https://pixorly.com
NEXT_PUBLIC_CDN_URL=https://$CLOUDFRONT_DOMAIN

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_SENTRY=false
EOF
