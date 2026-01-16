#!/bin/bash
set -e

echo "==> Pixorly AWS Infrastructure Cleanup"
echo "====================================="
echo ""
echo "[!] WARNING: This will destroy all AWS resources!"
echo "This includes:"
echo "  - S3 bucket and all images"
echo "  - CloudFront distribution"
echo "  - IAM users and policies"
echo "  - CloudWatch logs and alarms"
echo "  - Secrets Manager secrets"
echo ""

read -p "Are you ABSOLUTELY sure? Type 'destroy' to confirm: " confirm
if [ "$confirm" != "destroy" ]; then
    echo "[!] Aborted"
    exit 1
fi

cd "$(dirname "$0")/../terraform"

# Get bucket name
S3_BUCKET=$(terraform output -raw s3_bucket_name 2>/dev/null || echo "")

if [ -n "$S3_BUCKET" ]; then
    echo "[*] Emptying S3 bucket: $S3_BUCKET..."
    aws s3 rm "s3://$S3_BUCKET" --recursive || true
    
    # Delete all versions and delete markers
    aws s3api list-object-versions \
        --bucket "$S3_BUCKET" \
        --output json | \
    jq -r '.Versions[] | "--key \"\(.Key)\" --version-id \(.VersionId)"' | \
    xargs -I {} aws s3api delete-object --bucket "$S3_BUCKET" {} || true
    
    aws s3api list-object-versions \
        --bucket "$S3_BUCKET" \
        --output json | \
    jq -r '.DeleteMarkers[] | "--key \"\(.Key)\" --version-id \(.VersionId)"' | \
    xargs -I {} aws s3api delete-object --bucket "$S3_BUCKET" {} || true
    
    echo "[+] S3 bucket emptied"
fi

echo "[*] Destroying Terraform infrastructure..."
terraform destroy -auto-approve

echo "[*] Cleaning up local files..."
rm -f terraform-outputs.json
rm -f tfplan
rm -f cloudfront-private-key.pem
rm -f cloudfront-public-key.pem

echo ""
echo "[+] Cleanup complete!"
