#!/bin/bash

# Cleanup Script - Remove Documentation Files
# This removes all the setup/integration documentation files

cd /Users/shanice/Downloads/Hack4Good

echo "🧹 Cleaning up documentation files..."
echo ""

# List of documentation files to remove
FILES_TO_REMOVE=(
  "APP_FIX_SUMMARY.md"
  "ARCHITECTURE.md"
  "CHECK_TABLE_STRUCTURE.sql"
  "DEPENDENCY_FIX_GUIDE.md"
  "FINAL_INTEGRATION_GUIDE.md"
  "FIX_ID_TYPE_MISMATCH.md"
  "INTEGRATION_CHECKLIST.md"
  "INTEGRATION_SUMMARY.md"
  "MINIMAL_SUPABASE_SETUP.sql"
  "QUICK_INTEGRATION.md"
  "README_INTEGRATION.md"
  "START_HERE.md"
  "SUPABASE_SCHEMA.sql"
  "SUPABASE_SETUP_BIGINT.sql"
  "SUPABASE_SETUP_GUIDE.md"
  "YOUR_EXACT_SCHEMA_SETUP.sql"
  "cleanup-integration.sh"
  "fix-all-dependencies.sh"
  "fix-dependencies.sh"
  "src/types/database-bigint.ts"
  "src/lib/participantHooks-bigint.ts"
)

REMOVED=0
NOT_FOUND=0

for file in "${FILES_TO_REMOVE[@]}"; do
  if [ -f "$file" ]; then
    rm "$file"
    echo "✅ Removed: $file"
    REMOVED=$((REMOVED + 1))
  else
    echo "⏭️  Not found: $file"
    NOT_FOUND=$((NOT_FOUND + 1))
  fi
done

echo ""
echo "=================================="
echo "✅ Cleanup complete!"
echo "=================================="
echo "Removed: $REMOVED files"
echo "Not found: $NOT_FOUND files"
echo ""
echo "Your repository is now clean! 🎉"
