variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "prod"
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "pixorly"
}

variable "s3_bucket_name" {
  description = "S3 bucket name for image storage"
  type        = string
  default     = "pixorly-images-prod"
}

variable "glacier_transition_days" {
  description = "Number of days before transitioning to Glacier"
  type        = number
  default     = 90
}

variable "cloudfront_price_class" {
  description = "CloudFront price class"
  type        = string
  default     = "PriceClass_100" # US, Canada, Europe
}

variable "allowed_cors_origins" {
  description = "Allowed CORS origins for S3 bucket"
  type        = list(string)
  default     = ["https://pixorly.com", "https://www.pixorly.com"]
}
