#!/bin/bash
set -e

echo "==> Pixorly AWS Infrastructure Setup"
echo "===================================="
echo ""

# Check prerequisites
echo "[*] Checking prerequisites..."

if ! command -v terraform &> /dev/null; then
    echo "[!] ERROR: Terraform not found. Please install from https://www.terraform.io/downloads"
    exit 1
fi

if ! command -v aws &> /dev/null; then
    echo "[!] ERROR: AWS CLI not found. Please install from https://aws.amazon.com/cli/"
    exit 1
fi

if ! command -v openssl &> /dev/null; then
    echo "[!] ERROR: OpenSSL not found. Please install OpenSSL"
    exit 1
fi

echo "[+] All prerequisites met"
echo ""

# Navigate to terraform directory
cd "$(dirname "$0")/../terraform"

# Generate CloudFront key pair if not exists
if [ ! -f "cloudfront-private-key.pem" ]; then
    echo "[*] Generating CloudFront key pair..."
    openssl genrsa -out cloudfront-private-key.pem 2048
    openssl rsa -pubout -in cloudfront-private-key.pem -out cloudfront-public-key.pem
    echo "[+] CloudFront key pair generated"
    echo ""
else
    echo "[+] CloudFront key pair already exists"
    echo ""
fi

# Check AWS credentials
echo "[*] Checking AWS credentials..."
if ! aws sts get-caller-identity &> /dev/null; then
    echo "[!] ERROR: AWS credentials not configured. Run 'aws configure'"
    exit 1
fi
echo "[+] AWS credentials configured"
echo ""

# Create terraform.tfvars if not exists
if [ ! -f "terraform.tfvars" ]; then
    echo "[*] Creating terraform.tfvars..."
    cat > terraform.tfvars << EOF
aws_region              = "us-east-1"
environment             = "prod"
project_name            = "pixorly"
s3_bucket_name          = "pixorly-images-prod-\$(date +%s)"
glacier_transition_days = 90
allowed_cors_origins    = ["https://pixorly.com", "https://www.pixorly.com"]
EOF
    echo "[+] terraform.tfvars created"
    echo "[!] Please review and customize terraform.tfvars before proceeding"
    echo ""
fi

# Initialize Terraform
echo "[*] Initializing Terraform..."
terraform init
echo ""

# Validate configuration
echo "[*] Validating Terraform configuration..."
terraform validate
echo ""

# Plan infrastructure
echo "[*] Planning infrastructure..."
terraform plan -out=tfplan
echo ""

# Prompt for confirmation
read -p "[?] Do you want to apply this infrastructure? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "[!] Aborted"
    exit 1
fi

# Apply infrastructure
echo "[*] Deploying infrastructure..."
terraform apply tfplan
echo ""

# Save outputs
echo "[*] Saving outputs..."
terraform output -json > terraform-outputs.json
echo "[+] Outputs saved to terraform-outputs.json"
echo ""

# Display important outputs
echo "[*] Important Information:"
echo "========================="
echo ""
echo "S3 Bucket: $(terraform output -raw s3_bucket_name)"
echo "CloudFront Domain: $(terraform output -raw cloudfront_domain_name)"
echo "CloudFront Distribution ID: $(terraform output -raw cloudfront_distribution_id)"
echo ""
echo "[!] AWS Access Key ID and Secret are in terraform-outputs.json (keep secure!)"
echo ""

# Instructions for next steps
echo "[*] Next Steps:"
echo "=============="
echo ""
echo "1. Populate secrets in AWS Secrets Manager:"
echo "   ./scripts/populate-secrets.sh"
echo ""
echo "2. Generate environment variables for your application:"
echo "   ./scripts/generate-env.sh > ../../.env.local"
echo ""
echo "3. Test S3 upload:"
echo "   aws s3 cp test.png s3://$(terraform output -raw s3_bucket_name)/test.png"
echo ""
echo "4. Configure CloudWatch alarms with SNS:"
echo "   aws sns create-topic --name pixorly-alerts"
echo ""
echo "[+] Infrastructure setup complete!"
