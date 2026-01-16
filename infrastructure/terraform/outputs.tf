# Outputs for use in application and other Terraform modules

output "s3_bucket_name" {
  description = "Name of the S3 bucket for images"
  value       = aws_s3_bucket.images.id
}

output "s3_bucket_arn" {
  description = "ARN of the S3 bucket"
  value       = aws_s3_bucket.images.arn
}

output "s3_bucket_domain_name" {
  description = "Domain name of the S3 bucket"
  value       = aws_s3_bucket.images.bucket_regional_domain_name
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = aws_cloudfront_distribution.images.id
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name"
  value       = aws_cloudfront_distribution.images.domain_name
}

output "cloudfront_distribution_arn" {
  description = "CloudFront distribution ARN"
  value       = aws_cloudfront_distribution.images.arn
}

output "cloudfront_key_group_id" {
  description = "CloudFront key group ID for signed URLs"
  value       = aws_cloudfront_key_group.signing_key_group.id
}

output "cloudfront_public_key_id" {
  description = "CloudFront public key ID"
  value       = aws_cloudfront_public_key.signing_key.id
}

output "iam_user_name" {
  description = "IAM user name for application"
  value       = aws_iam_user.pixorly_app.name
}

output "iam_user_arn" {
  description = "IAM user ARN"
  value       = aws_iam_user.pixorly_app.arn
}

output "aws_access_key_id" {
  description = "AWS Access Key ID for application user"
  value       = aws_iam_access_key.pixorly_app.id
  sensitive   = true
}

output "aws_secret_access_key" {
  description = "AWS Secret Access Key for application user"
  value       = aws_iam_access_key.pixorly_app.secret
  sensitive   = true
}

output "cloudwatch_log_groups" {
  description = "CloudWatch log group names"
  value = {
    application = aws_cloudwatch_log_group.app_logs.name
    generation  = aws_cloudwatch_log_group.generation_logs.name
    api         = aws_cloudwatch_log_group.api_logs.name
    errors      = aws_cloudwatch_log_group.error_logs.name
  }
}

output "secrets_manager_arns" {
  description = "ARNs of Secrets Manager secrets"
  value = {
    openrouter         = aws_secretsmanager_secret.openrouter_api_key.arn
    clerk              = aws_secretsmanager_secret.clerk_secret_key.arn
    cloudfront_key     = aws_secretsmanager_secret.cloudfront_private_key.arn
    stripe             = aws_secretsmanager_secret.stripe_secret_key.arn
    stripe_webhook     = aws_secretsmanager_secret.stripe_webhook_secret.arn
    convex             = aws_secretsmanager_secret.convex_deploy_key.arn
    database           = aws_secretsmanager_secret.database_url.arn
  }
}

output "aws_region" {
  description = "AWS region where resources are deployed"
  value       = var.aws_region
}
