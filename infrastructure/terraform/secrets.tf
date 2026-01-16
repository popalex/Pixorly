# AWS Secrets Manager - Store sensitive credentials

# OpenRouter API Key
resource "aws_secretsmanager_secret" "openrouter_api_key" {
  name                    = "pixorly/openrouter-api-key"
  description             = "OpenRouter API key for AI image generation"
  recovery_window_in_days = 7

  tags = {
    Name        = "OpenRouter API Key"
    Environment = var.environment
  }
}

# Clerk Secret Keys
resource "aws_secretsmanager_secret" "clerk_secret_key" {
  name                    = "pixorly/clerk-secret-key"
  description             = "Clerk secret key for authentication"
  recovery_window_in_days = 7

  tags = {
    Name        = "Clerk Secret Key"
    Environment = var.environment
  }
}

# CloudFront Private Key (for signed URLs)
resource "aws_secretsmanager_secret" "cloudfront_private_key" {
  name                    = "pixorly/cloudfront-private-key"
  description             = "CloudFront private key for generating signed URLs"
  recovery_window_in_days = 7

  tags = {
    Name        = "CloudFront Private Key"
    Environment = var.environment
  }
}

# Stripe Secret Key
resource "aws_secretsmanager_secret" "stripe_secret_key" {
  name                    = "pixorly/stripe-secret-key"
  description             = "Stripe secret key for payment processing"
  recovery_window_in_days = 7

  tags = {
    Name        = "Stripe Secret Key"
    Environment = var.environment
  }
}

# Stripe Webhook Secret
resource "aws_secretsmanager_secret" "stripe_webhook_secret" {
  name                    = "pixorly/stripe-webhook-secret"
  description             = "Stripe webhook signing secret"
  recovery_window_in_days = 7

  tags = {
    Name        = "Stripe Webhook Secret"
    Environment = var.environment
  }
}

# Convex Deploy Key
resource "aws_secretsmanager_secret" "convex_deploy_key" {
  name                    = "pixorly/convex-deploy-key"
  description             = "Convex deployment key"
  recovery_window_in_days = 7

  tags = {
    Name        = "Convex Deploy Key"
    Environment = var.environment
  }
}

# Database connection string (if using additional DB)
resource "aws_secretsmanager_secret" "database_url" {
  name                    = "pixorly/database-url"
  description             = "Database connection string"
  recovery_window_in_days = 7

  tags = {
    Name        = "Database URL"
    Environment = var.environment
  }
}

# Note: Actual secret values should be set manually or via separate process
# Example command to set a secret value:
# aws secretsmanager put-secret-value --secret-id pixorly/openrouter-api-key --secret-string "your-api-key-here"
