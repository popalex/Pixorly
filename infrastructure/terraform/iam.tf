# Application IAM User
resource "aws_iam_user" "pixorly_app" {
  name = "${var.project_name}-app-user"
  path = "/applications/"

  tags = {
    Name        = "Pixorly Application User"
    Environment = var.environment
  }
}

# IAM Policy for S3 Access
resource "aws_iam_policy" "s3_access" {
  name        = "${var.project_name}-s3-access"
  description = "Allows Pixorly application to manage images in S3"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "ListBucket"
        Effect = "Allow"
        Action = [
          "s3:ListBucket",
          "s3:GetBucketLocation"
        ]
        Resource = aws_s3_bucket.images.arn
      },
      {
        Sid    = "ObjectAccess"
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:GetObjectVersion"
        ]
        Resource = "${aws_s3_bucket.images.arn}/*"
      }
    ]
  })
}

# IAM Policy for CloudFront Access
resource "aws_iam_policy" "cloudfront_access" {
  name        = "${var.project_name}-cloudfront-access"
  description = "Allows Pixorly to create CloudFront signed URLs"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "CloudFrontAccess"
        Effect = "Allow"
        Action = [
          "cloudfront:GetDistribution",
          "cloudfront:ListDistributions"
        ]
        Resource = "*"
      }
    ]
  })
}

# IAM Policy for CloudWatch Logs
resource "aws_iam_policy" "cloudwatch_logs" {
  name        = "${var.project_name}-cloudwatch-logs"
  description = "Allows Pixorly to write logs to CloudWatch"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "CloudWatchLogs"
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogStreams"
        ]
        Resource = "arn:aws:logs:${var.aws_region}:*:log-group:/aws/pixorly/*"
      },
      {
        Sid    = "CloudWatchMetrics"
        Effect = "Allow"
        Action = [
          "cloudwatch:PutMetricData"
        ]
        Resource = "*"
        Condition = {
          StringEquals = {
            "cloudwatch:namespace" = "Pixorly"
          }
        }
      }
    ]
  })
}

# IAM Policy for Secrets Manager
resource "aws_iam_policy" "secrets_access" {
  name        = "${var.project_name}-secrets-access"
  description = "Allows Pixorly to read secrets from Secrets Manager"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "SecretsAccess"
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Resource = "arn:aws:secretsmanager:${var.aws_region}:*:secret:pixorly/*"
      }
    ]
  })
}

# Attach policies to application user
resource "aws_iam_user_policy_attachment" "app_s3" {
  user       = aws_iam_user.pixorly_app.name
  policy_arn = aws_iam_policy.s3_access.arn
}

resource "aws_iam_user_policy_attachment" "app_cloudfront" {
  user       = aws_iam_user.pixorly_app.name
  policy_arn = aws_iam_policy.cloudfront_access.arn
}

resource "aws_iam_user_policy_attachment" "app_cloudwatch" {
  user       = aws_iam_user.pixorly_app.name
  policy_arn = aws_iam_policy.cloudwatch_logs.arn
}

resource "aws_iam_user_policy_attachment" "app_secrets" {
  user       = aws_iam_user.pixorly_app.name
  policy_arn = aws_iam_policy.secrets_access.arn
}

# Create access key for application (initial setup only)
resource "aws_iam_access_key" "pixorly_app" {
  user = aws_iam_user.pixorly_app.name
}
