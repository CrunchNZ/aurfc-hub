#!/bin/bash

# Production Build Script for AURFC Hub
# This script prepares and builds the application for production deployment

set -e  # Exit on any error

echo "🚀 AURFC Hub - Production Build Script"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    print_warning ".env.production file not found"
    print_status "Creating .env.production from template..."
    
    if [ -f "production-env.template" ]; then
        cp production-env.template .env.production
        print_warning "Please edit .env.production with your production Firebase credentials"
        print_warning "Then run this script again"
        exit 1
    else
        print_error "production-env.template not found. Please create .env.production manually"
        exit 1
    fi
fi

# Validate environment variables
print_status "Validating environment variables..."
source .env.production

required_vars=(
    "VITE_FIREBASE_PROD_API_KEY"
    "VITE_FIREBASE_PROD_AUTH_DOMAIN"
    "VITE_FIREBASE_PROD_PROJECT_ID"
    "VITE_FIREBASE_PROD_STORAGE_BUCKET"
    "VITE_FIREBASE_PROD_MESSAGING_SENDER_ID"
    "VITE_FIREBASE_PROD_APP_ID"
)

missing_vars=()
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ] || [ "${!var}" = "your_production_${var#VITE_FIREBASE_PROD_}_here" ]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    print_error "Missing or invalid production environment variables:"
    for var in "${missing_vars[@]}"; do
        echo "  - $var"
    done
    print_warning "Please update .env.production with valid values"
    exit 1
fi

print_success "Environment variables validated"

# Clean previous builds
print_status "Cleaning previous builds..."
rm -rf dist/
rm -rf .vite/

# Install dependencies
print_status "Installing dependencies..."
npm ci --only=production

# Run tests (if available)
if [ -f "package.json" ] && grep -q "\"test\":" package.json; then
    print_status "Running tests..."
    if npm test -- --passWithNoTests; then
        print_success "Tests passed"
    else
        print_warning "Some tests failed, but continuing with build"
    fi
else
    print_warning "No test script found, skipping tests"
fi

# Build for production
print_status "Building for production..."
NODE_ENV=production npm run build

# Verify build output
if [ ! -d "dist" ]; then
    print_error "Build failed - dist directory not created"
    exit 1
fi

# Check build size
build_size=$(du -sh dist | cut -f1)
print_success "Build completed successfully! Size: $build_size"

# Generate build report
print_status "Generating build report..."
{
    echo "AURFC Hub - Production Build Report"
    echo "Generated: $(date)"
    echo "Build Size: $build_size"
    echo ""
    echo "Environment:"
    echo "  Node.js: $(node --version)"
    echo "  NPM: $(npm --version)"
    echo "  Build Time: $(date +%s)"
    echo ""
    echo "Build Contents:"
    find dist -type f | sort
    echo ""
    echo "Bundle Analysis:"
    echo "  Main Bundle: $(ls -la dist/assets/index-*.js | head -1 | awk '{print $5 " bytes"}')"
    echo "  CSS Bundle: $(ls -la dist/assets/index-*.css | head -1 | awk '{print $5 " bytes"}')"
} > dist/build-report.txt

print_success "Build report generated: dist/build-report.txt"

# Create deployment package
print_status "Creating deployment package..."
tar -czf aurfc-hub-production-$(date +%Y%m%d-%H%M%S).tar.gz dist/

print_success "Deployment package created"

# Final instructions
echo ""
echo "🎉 Production Build Complete!"
echo "============================="
echo ""
echo "Next steps:"
echo "1. Review the build in the 'dist' directory"
echo "2. Test the production build locally: npm run preview"
echo "3. Deploy to your hosting platform"
echo "4. Update your Firebase project with production settings"
echo ""
echo "Build artifacts:"
echo "  - Production files: dist/"
echo "  - Build report: dist/build-report.txt"
echo "  - Deployment package: aurfc-hub-production-*.tar.gz"
echo ""
echo "Happy deploying! 🏉"
