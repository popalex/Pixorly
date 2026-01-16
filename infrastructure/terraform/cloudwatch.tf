# CloudWatch Log Groups
resource "aws_cloudwatch_log_group" "app_logs" {
  name              = "/aws/pixorly/application"
  retention_in_days = 30

  tags = {
    Name        = "Pixorly Application Logs"
    Environment = var.environment
  }
}

resource "aws_cloudwatch_log_group" "generation_logs" {
  name              = "/aws/pixorly/generation"
  retention_in_days = 30

  tags = {
    Name        = "Pixorly Generation Logs"
    Environment = var.environment
  }
}

resource "aws_cloudwatch_log_group" "api_logs" {
  name              = "/aws/pixorly/api"
  retention_in_days = 30

  tags = {
    Name        = "Pixorly API Logs"
    Environment = var.environment
  }
}

resource "aws_cloudwatch_log_group" "error_logs" {
  name              = "/aws/pixorly/errors"
  retention_in_days = 90

  tags = {
    Name        = "Pixorly Error Logs"
    Environment = var.environment
  }
}

# CloudWatch Alarms
resource "aws_cloudwatch_metric_alarm" "high_error_rate" {
  alarm_name          = "${var.project_name}-high-error-rate"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "ErrorCount"
  namespace           = "Pixorly"
  period              = 300
  statistic           = "Sum"
  threshold           = 10
  alarm_description   = "Alert when error count exceeds threshold"
  treat_missing_data  = "notBreaching"

  tags = {
    Name        = "High Error Rate Alarm"
    Environment = var.environment
  }
}

resource "aws_cloudwatch_metric_alarm" "high_s3_costs" {
  alarm_name          = "${var.project_name}-high-s3-costs"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "EstimatedCharges"
  namespace           = "AWS/Billing"
  period              = 86400
  statistic           = "Maximum"
  threshold           = 100
  alarm_description   = "Alert when estimated S3 costs exceed $100"
  treat_missing_data  = "notBreaching"

  dimensions = {
    ServiceName = "AmazonS3"
    Currency    = "USD"
  }

  tags = {
    Name        = "High S3 Cost Alarm"
    Environment = var.environment
  }
}

resource "aws_cloudwatch_metric_alarm" "cloudfront_5xx_errors" {
  alarm_name          = "${var.project_name}-cloudfront-5xx-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "5xxErrorRate"
  namespace           = "AWS/CloudFront"
  period              = 300
  statistic           = "Average"
  threshold           = 5
  alarm_description   = "Alert when CloudFront 5xx error rate exceeds 5%"
  treat_missing_data  = "notBreaching"

  dimensions = {
    DistributionId = aws_cloudfront_distribution.images.id
  }

  tags = {
    Name        = "CloudFront 5xx Error Alarm"
    Environment = var.environment
  }
}
