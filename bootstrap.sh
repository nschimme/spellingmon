#!/usr/bin/env bash
#
# Spellingmon Bootstrap / Launcher
#
# This script ensures dependencies are installed and launches
# the Spellingmon development server.
#
# Usage:
#   ./bootstrap.sh          # Install deps (if needed) and start dev server
#   ./bootstrap.sh --force  # Force reinstall of dependencies then start
#   ./bootstrap.sh build    # Install deps and build for production
#   ./bootstrap.sh preview  # Build and preview the production build
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

info()    { echo -e "${BLUE}[info]${NC} $1"; }
success() { echo -e "${GREEN}[ok]${NC}   $1"; }
warn()    { echo -e "${YELLOW}[warn]${NC} $1"; }
error()   { echo -e "${RED}[error]${NC} $1" >&2; }

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    error "Required command '$1' not found. Please install it and try again."
    exit 1
  fi
}

check_node_version() {
  local version
  version=$(node -v | sed 's/^v//')
  local major
  major=$(echo "$version" | cut -d. -f1)

  if [ "$major" -lt 18 ]; then
    error "Node.js 18 or newer is required (found v$version)."
    error "Please upgrade Node.js: https://nodejs.org/"
    exit 1
  fi
  success "Node.js v$version detected"
}

install_deps() {
  local force="${1:-false}"

  if [ "$force" = "true" ] || [ ! -d "node_modules" ]; then
    if [ -f "package-lock.json" ]; then
      info "Installing dependencies with 'npm ci' (reproducible install)..."
      npm ci
    else
      info "Installing dependencies with 'npm install'..."
      npm install
    fi
    success "Dependencies installed"
  else
    success "node_modules already present — skipping install"
    info "(run with --force to reinstall)"
  fi
}

start_dev() {
  info "Starting Vite development server..."
  echo
  success "Spellingmon is ready!"
  echo
  echo "  Local URL:    http://localhost:5173"
  echo "  Network:      Check the 'Network' address printed by Vite"
  echo
  echo "Press Ctrl+C to stop the server."
  echo
  npm run dev
}

do_build() {
  info "Building production bundle..."
  npm run build
  success "Build complete. Output is in ./dist/"
}

do_preview() {
  info "Previewing production build..."
  npm run build
  success "Starting preview server..."
  echo
  echo "  Preview URL: http://localhost:4173"
  echo
  npm run preview
}

print_usage() {
  cat <<EOF
Spellingmon bootstrap script

Usage:
  ./bootstrap.sh                 Start development server (installs deps if needed)
  ./bootstrap.sh --force         Force reinstall dependencies, then start dev server
  ./bootstrap.sh build           Install deps and run production build
  ./bootstrap.sh preview         Build and start local preview server
  ./bootstrap.sh --force build   Force reinstall then build
  ./bootstrap.sh help            Show this help

After starting the dev server, open http://localhost:5173 in your browser.
EOF
}

main() {
  local force=false
  local cmd="dev"

  # Parse arguments
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --force|-f)
        force=true
        shift
        ;;
      -h|--help|help)
        print_usage
        exit 0
        ;;
      dev|start|build|preview)
        cmd="$1"
        shift
        ;;
      *)
        error "Unknown argument: $1"
        print_usage
        exit 1
        ;;
    esac
  done

  info "Spellingmon bootstrap starting..."
  require_cmd node
  require_cmd npm
  check_node_version

  case "$cmd" in
    dev|start)
      install_deps "$force"
      start_dev
      ;;
    build)
      install_deps "$force"
      do_build
      ;;
    preview)
      install_deps "$force"
      do_preview
      ;;
  esac
}

main "$@"
