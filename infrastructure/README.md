# Pixorly AWS Infrastructure

This directory contains Infrastructure as Code (IaC) for Pixorly's AWS resources using Terraform.

## 📋 Prerequisites

- AWS Account
- [Terraform](https://www.terraform.io/downloads) >= 1.0
- [AWS CLI](https://aws.amazon.com/cli/) configured
- OpenSSL (for generating CloudFront key pair)

## 🚀 Quick Start

### 1. Generate CloudFront Key Pair

CloudFront signed URLs require a public/private key pair:

```bash
# Navigate to terraform directory
cd infrastructure/terraform

# Generate private key
openssl genrsa -out cloudfront-private-key.pem 2048

# Generate public key
openssl rsa -pubout -in cloudfront-private-key.pem -out cloudfront-public-key.pem

# IMPORTANT: Keep private key secure - add to .gitignore
echo "cloudfront-private-key.pem" >> ../../.gitignore
```

### 2. Configure AWS Credentials

```bash
# Configure AWS CLI (if not already done)
aws configure

# Or set environment variables
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export AWS_DEFAULT_REGION="us-east-1"
```

### 3. Initialize Terraform

```bash
cd infrastructure/terraform
terraform init
```

### 4. Review and Customize Variables

Create a `terraform.tfvars` file:

```hcl
aws_region              = "us-east-1"
environment             = "prod"
project_name            = "pixorly"
s3_bucket_name          = "pixorly-images-prod"
glacier_transition_days = 90
allowed_cors_origins    = ["https://pixorly.com", "https://www.pixorly.com"]
```

### 5. Plan Infrastructure

```bash
terraform plan -out=tfplan
```

Review the plan carefully to ensure all resources are correct.

### 6. Deploy Infrastructure

```bash
terraform apply tfplan
```

This will create:

- ✅ S3 bucket with versioning and lifecycle policies
- ✅ CloudFront distribution with OAC
- ✅ IAM users and policies
- ✅ CloudWatch log groups and alarms
- ✅ Secrets Manager secrets (empty - need to be populated)

### 7. Save Outputs

```bash
# View all outputs
terraform output

# Save sensitive outputs securely
terraform output -json > terraform-outputs.json

# Extract specific values
terraform output -raw aws_access_key_id
terraform output -raw aws_secret_access_key
terraform output -raw cloudfront_domain_name
```

## 🔐 Configure Secrets

After deployment, populate secrets in AWS Secrets Manager:

```bash
# OpenRouter API Key
aws secretsmanager put-secret-value \
  --secret-id pixorly/openrouter-api-key \
  --secret-string "your-openrouter-api-key"

# Clerk Secret Key
aws secretsmanager put-secret-value \
  --secret-id pixorly/clerk-secret-key \
  --secret-string "your-clerk-secret-key"

# CloudFront Private Key
aws secretsmanager put-secret-value \
  --secret-id pixorly/cloudfront-private-key \
  --secret-string "$(cat cloudfront-private-key.pem)"

# Stripe Secret Key
aws secretsmanager put-secret-value \
  --secret-id pixorly/stripe-secret-key \
  --secret-string "your-stripe-secret-key"

# Stripe Webhook Secret
aws secretsmanager put-secret-value \
  --secret-id pixorly/stripe-webhook-secret \
  --secret-string "your-stripe-webhook-secret"

# Convex Deploy Key
aws secretsmanager put-secret-value \
  --secret-id pixorly/convex-deploy-key \
  --secret-string "your-convex-deploy-key"
```

## 🌍 Environment Variables for Application

Create a `.env.local` file in your Next.js project root:

```bash
# Get outputs from Terraform
AWS_ACCESS_KEY_ID=$(terraform output -raw aws_access_key_id)
AWS_SECRET_ACCESS_KEY=$(terraform output -raw aws_secret_access_key)
AWS_REGION=$(terraform output -raw aws_region)
AWS_S3_BUCKET=$(terraform output -raw s3_bucket_name)
CLOUDFRONT_DOMAIN=$(terraform output -raw cloudfront_domain_name)
CLOUDFRONT_KEY_PAIR_ID=$(terraform output -raw cloudfront_public_key_id)
```

Or use the provided script:

```bash
cd infrastructure/scripts
./generate-env.sh > ../../.env.local
```

## 📊 Monitoring

### CloudWatch Dashboards

Access CloudWatch in AWS Console to view:

- Application logs: `/aws/pixorly/application`
- Generation logs: `/aws/pixorly/generation`
- API logs: `/aws/pixorly/api`
- Error logs: `/aws/pixorly/errors`

### Alarms

The following alarms are configured:

- **High Error Rate**: Triggers when error count > 10 in 5 minutes
- **High S3 Costs**: Triggers when estimated costs > $100/day
- **CloudFront 5xx Errors**: Triggers when 5xx error rate > 5%

To add SNS notifications:

```bash
# Create SNS topic
aws sns create-topic --name pixorly-alerts

# Subscribe your email
aws sns subscribe \
  --topic-arn arn:aws:sns:us-east-1:ACCOUNT_ID:pixorly-alerts \
  --protocol email \
  --notification-endpoint your-email@example.com
```

## 🔄 State Management

For production, configure remote state storage:

1. Create S3 bucket for state:

```bash
aws s3 mb s3://pixorly-terraform-state
aws s3api put-bucket-versioning \
  --bucket pixorly-terraform-state \
  --versioning-configuration Status=Enabled
```

2. Create DynamoDB table for state locking:

```bash
aws dynamodb create-table \
  --table-name pixorly-terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST
```

3. Uncomment backend configuration in `main.tf`

4. Migrate state:

```bash
terraform init -migrate-state
```

## 🧹 Cleanup

To destroy all resources (⚠️ USE WITH CAUTION):

```bash
terraform destroy
```

Note: S3 bucket must be empty before destruction. Use:

```bash
aws s3 rm s3://pixorly-images-prod --recursive
```

## 📁 File Structure

```
infrastructure/
├── terraform/
│   ├── main.tf                  # Provider and backend config
│   ├── variables.tf             # Input variables
│   ├── outputs.tf               # Output values
│   ├── s3.tf                    # S3 bucket configuration
│   ├── cloudfront.tf            # CloudFront CDN
│   ├── iam.tf                   # IAM users and policies
│   ├── cloudwatch.tf            # Logging and monitoring
│   ├── secrets.tf               # Secrets Manager
│   ├── cloudfront-public-key.pem  # CloudFront public key (generated)
│   └── cloudfront-private-key.pem # CloudFront private key (generated, gitignored)
├── scripts/
│   ├── setup.sh                 # Complete setup script
│   ├── generate-env.sh          # Generate .env file
│   └── cleanup.sh               # Cleanup script
└── README.md                    # This file
```

## 🔒 Security Best Practices

1. **Never commit secrets**: Private keys and credentials should never be in version control
2. **Use IAM roles**: For production, use IAM roles instead of access keys where possible
3. **Rotate keys**: Regularly rotate access keys and secrets
4. **Enable MFA**: Enable MFA on AWS root and IAM users
5. **Least privilege**: IAM policies grant only necessary permissions
6. **Encrypt at rest**: S3 encryption is enabled by default
7. **Encrypt in transit**: CloudFront uses HTTPS

## 💰 Cost Estimation

**Monthly Costs (estimated for 100 users):**

- S3 Storage (100GB): ~$2.30
- S3 Requests: ~$0.50
- CloudFront (1TB transfer): ~$85
- CloudWatch Logs: ~$5
- Secrets Manager (7 secrets): ~$2.80
- **Total**: ~$95-100/month

Use AWS Cost Calculator for accurate estimates: https://calculator.aws/

## 🆘 Troubleshooting

### "Error: creating S3 Bucket: BucketAlreadyExists"

The bucket name must be globally unique. Change `s3_bucket_name` in `terraform.tfvars`.

### "Error: file not found: cloudfront-public-key.pem"

Generate the CloudFront key pair first (see Step 1).

### "Access Denied" errors

Ensure your AWS credentials have sufficient permissions to create resources.

### State locking errors

If state is locked, identify the lock ID and force unlock:

```bash
terraform force-unlock <LOCK_ID>
```

## 📚 Additional Resources

- [Terraform AWS Provider Docs](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [AWS S3 Best Practices](https://docs.aws.amazon.com/AmazonS3/latest/userguide/best-practices.html)
- [CloudFront Signed URLs](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-signed-urls.html)
- [AWS Secrets Manager](https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html)

## 📝 Checklist

- [ ] AWS account created
- [ ] AWS CLI configured
- [ ] Terraform installed
- [ ] CloudFront key pair generated
- [ ] Variables configured in `terraform.tfvars`
- [ ] Infrastructure deployed (`terraform apply`)
- [ ] Secrets populated in Secrets Manager
- [ ] Environment variables configured
- [ ] CloudWatch alarms tested
- [ ] SNS notifications configured
- [ ] Remote state backend configured (production)
